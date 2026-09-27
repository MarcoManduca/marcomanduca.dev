"""DynamoDB-backed rate limiting for the contact form.

State lives in a small DynamoDB table with a TTL attribute instead of in
process memory, so the limit is shared across every Lambda execution
environment and survives cold starts. Two counters are enforced:

* a per-network fixed window (``<ip>#<window_start>``, IPv6 grouped by
  ``/64``), checked on every request before the body is validated, and
* a site-wide daily cap (``global#<YYYY-MM-DD>``, UTC), which bounds SES
  cost and inbox flooding even when an attacker rotates IPs. It is only
  spent by submissions that will actually send an email, so honeypot hits
  and invalid payloads cannot exhaust it for everyone else, and the unit is
  given back when SES then fails to take the email.

Each check atomically increments its counter; DynamoDB drops the items
automatically once their window has elapsed (TTL).

Fixed windows allow a burst of up to twice the per-network limit across a
window boundary (``max_requests`` hits at the end of one window plus
``max_requests`` at the start of the next). This is accepted: the daily cap
bounds the total, and a sliding window would need extra reads per request.

The limiter fails closed: when DynamoDB is unavailable the request is
rejected with 503 rather than letting unmetered traffic reach SES.

The caller is identified by ``src.utils.client_ip`` (CloudFront-set viewer
IP, never ``X-Forwarded-For``).
"""

import logging
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, Request, status

from src.config import get_settings
from src.models.base import get_dynamodb_resource
from src.services.errors import EmailDeliveryError
from src.utils.client_ip import client_ip, network_key

logger = logging.getLogger(__name__)

# Small grace added to the TTL so an item never expires mid-window.
_TTL_GRACE_SECONDS = 60
_GLOBAL_KEY_PREFIX = "global"


class RateLimiterUnavailableError(Exception):
    """Raised when the rate-limit backend cannot be reached."""


class DynamoRateLimiter:
    """Per-key fixed-window counter plus a global daily cap in DynamoDB.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource with a string hash key ``pk``
        and a numeric TTL attribute ``expires_at``.
    max_requests : int
        Maximum number of requests per key inside a single window.
    window_seconds : int
        Length of the fixed window in seconds.
    daily_max : int
        Maximum number of accepted requests per UTC day, across all keys.
    """

    def __init__(
        self, table: Any, max_requests: int, window_seconds: int, daily_max: int
    ) -> None:
        self._table = table
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._daily_max = daily_max

    def allow_key(self, key: str, now: float | None = None) -> bool:
        """Record a hit for ``key`` in its window and report if it is allowed.

        Parameters
        ----------
        key : str
            Identifier of the caller (typically its network, see
            :func:`src.utils.client_ip.network_key`).
        now : float, optional
            Epoch timestamp override, used by tests to control the clock.
            Defaults to ``time.time()``.

        Returns
        -------
        bool
            ``True`` while ``key`` is within ``max_requests`` for the window.

        Raises
        ------
        RateLimiterUnavailableError
            When DynamoDB rejects or fails the counter update.
        """
        current = time.time() if now is None else now
        window_start = int(current // self._window_seconds) * self._window_seconds
        window_ttl = window_start + self._window_seconds + _TTL_GRACE_SECONDS
        return self._hit(f"{key}#{window_start}", window_ttl) <= self._max_requests

    def allow_daily(self, now: float | None = None) -> bool:
        """Record a hit on the site-wide daily counter and report if allowed.

        Parameters
        ----------
        now : float, optional
            Epoch timestamp override, used by tests to control the clock.
            Defaults to ``time.time()``.

        Returns
        -------
        bool
            ``True`` while the UTC day is within ``daily_max``.

        Raises
        ------
        RateLimiterUnavailableError
            When DynamoDB rejects or fails the counter update.
        """
        current = time.time() if now is None else now
        global_key, day_end = _daily_counter(current)
        return self._hit(global_key, day_end + _TTL_GRACE_SECONDS) <= self._daily_max

    def release_daily(self, now: float) -> None:
        """Give back one unit of the daily counter spent at ``now``.

        Best effort and never below zero: the decrement is atomic and
        conditional, and a failure is logged rather than raised, so it can
        cost one unit of budget but never the caller's response.

        Parameters
        ----------
        now : float
            Epoch timestamp the unit was spent at (it selects the UTC day).
        """
        global_key, _ = _daily_counter(now)
        try:
            self._table.update_item(
                Key={"pk": global_key},
                UpdateExpression="ADD hits :minus_one",
                ConditionExpression="hits > :zero",
                ExpressionAttributeValues={":minus_one": -1, ":zero": 0},
            )
        except (ClientError, BotoCoreError) as exc:
            logger.warning(
                "rate_limit_release_failed", extra={"error_type": type(exc).__name__}
            )

    def _hit(self, pk: str, expires_at: int) -> int:
        """Atomically increment a counter and return its new value."""
        try:
            response = self._table.update_item(
                Key={"pk": pk},
                UpdateExpression=(
                    "ADD hits :one SET expires_at = if_not_exists(expires_at, :ttl)"
                ),
                ExpressionAttributeValues={":one": 1, ":ttl": expires_at},
                ReturnValues="UPDATED_NEW",
            )
        except (ClientError, BotoCoreError) as exc:
            raise RateLimiterUnavailableError(type(exc).__name__) from exc
        return int(response["Attributes"]["hits"])


def _daily_counter(now: float) -> tuple[str, int]:
    """Key and TTL of the site-wide counter for the UTC day of ``now``."""
    day = datetime.fromtimestamp(now, UTC).date()
    day_end = datetime(day.year, day.month, day.day, tzinfo=UTC) + timedelta(days=1)
    return f"{_GLOBAL_KEY_PREFIX}#{day.isoformat()}", int(day_end.timestamp())


_contact_limiter: DynamoRateLimiter | None = None


def get_contact_limiter() -> DynamoRateLimiter:
    """Return the lazily-built limiter for the contact endpoint.

    Returns
    -------
    DynamoRateLimiter
        Limiter bound to the rate-limit table and configured from settings.
    """
    global _contact_limiter
    if _contact_limiter is None:
        settings = get_settings()
        table = get_dynamodb_resource().Table(settings.ratelimit_table_name)
        _contact_limiter = DynamoRateLimiter(
            table=table,
            max_requests=settings.contact_rate_limit_max_requests,
            window_seconds=settings.contact_rate_limit_window_seconds,
            daily_max=settings.contact_rate_limit_daily_max,
        )
    return _contact_limiter


def reset_contact_limiter() -> None:
    """Discard the contact limiter so it is rebuilt from settings."""
    global _contact_limiter
    _contact_limiter = None


def enforce_contact_rate_limit(request: Request) -> None:
    """FastAPI dependency enforcing the per-network contact limit.

    It runs before the body is validated, so bots are throttled whatever
    they send.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request, used to identify the caller.

    Raises
    ------
    fastapi.HTTPException
        With status 429 when the caller exceeded its window, and 503 when
        the rate-limit backend is unavailable (fail closed).
    """
    key = network_key(client_ip(request))
    _enforce(lambda: get_contact_limiter().allow_key(key))


@contextmanager
def contact_daily_slot() -> Iterator[None]:
    """Spend one unit of the site-wide daily budget on sending an email.

    Wrap the send of a valid, non-honeypot submission. When the send fails
    with :class:`EmailDeliveryError` no email went out, so the unit is given
    back before the error propagates (and becomes a 503).

    Yields
    ------
    None
        Control to the email send.

    Raises
    ------
    fastapi.HTTPException
        With status 429 when the daily cap is reached, and 503 when the
        rate-limit backend is unavailable (fail closed).
    """
    limiter = get_contact_limiter()
    spent_at = time.time()
    _enforce(lambda: limiter.allow_daily(spent_at))
    try:
        yield
    except EmailDeliveryError:
        limiter.release_daily(spent_at)
        raise


def _enforce(check: Callable[[], bool]) -> None:
    """Run a limiter check, mapping its outcome to HTTP errors."""
    try:
        allowed = check()
    except RateLimiterUnavailableError as exc:
        # No IP or payload in the log: only the failure class.
        logger.error("rate_limit_unavailable", extra={"error_type": str(exc)})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        ) from exc
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
