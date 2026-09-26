"""DynamoDB-backed rate limiting for the contact form.

State lives in a small DynamoDB table with a TTL attribute instead of in
process memory, so the limit is shared across every Lambda execution
environment and survives cold starts. Two counters are enforced:

* a per-IP fixed window (``<ip>#<window_start>``), and
* a site-wide daily cap (``global#<YYYY-MM-DD>``, UTC), which bounds SES
  cost and inbox flooding even when an attacker rotates IPs.

Each request atomically increments the counters; DynamoDB drops the items
automatically once their window has elapsed (TTL).

Fixed windows allow a burst of up to twice the per-IP limit across a window
boundary (``max_requests`` hits at the end of one window plus
``max_requests`` at the start of the next). This is accepted: the daily cap
bounds the total, and a sliding window would need extra reads per request.

The limiter fails closed: when DynamoDB is unavailable the request is
rejected with 503 rather than letting unmetered traffic reach SES.

The client IP comes from the ``x-viewer-ip`` header, which the CloudFront
viewer-request function on ``/api/*`` overwrites with the true viewer IP.
``X-Forwarded-For`` is never trusted: clients can prepend arbitrary values.
Direct calls to API Gateway that could forge ``x-viewer-ip`` are rejected
earlier by the origin-verify middleware.
"""

import logging
import time
from datetime import UTC, datetime, timedelta
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, Request, status

from src.config import get_settings
from src.models.base import get_dynamodb_resource

logger = logging.getLogger(__name__)

# Small grace added to the TTL so an item never expires mid-window.
_TTL_GRACE_SECONDS = 60
_VIEWER_IP_HEADER = "x-viewer-ip"
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

    def is_allowed(self, key: str, now: float | None = None) -> bool:
        """Record a hit for ``key`` and report whether it is allowed.

        The global counter is only incremented when the per-key limit
        passes, so a single noisy caller cannot exhaust the daily budget
        beyond its own per-window allowance.

        Parameters
        ----------
        key : str
            Identifier of the caller (typically a client IP).
        now : float, optional
            Epoch timestamp override, used by tests to control the clock.
            Defaults to ``time.time()``.

        Returns
        -------
        bool
            ``True`` if both limits allow the request, ``False`` otherwise.

        Raises
        ------
        RateLimiterUnavailableError
            When DynamoDB rejects or fails the counter update.
        """
        current = time.time() if now is None else now
        window_start = int(current // self._window_seconds) * self._window_seconds
        window_ttl = window_start + self._window_seconds + _TTL_GRACE_SECONDS
        if self._hit(f"{key}#{window_start}", window_ttl) > self._max_requests:
            return False
        day = datetime.fromtimestamp(current, UTC).date()
        day_end = datetime(day.year, day.month, day.day, tzinfo=UTC) + timedelta(days=1)
        day_ttl = int(day_end.timestamp()) + _TTL_GRACE_SECONDS
        global_key = f"{_GLOBAL_KEY_PREFIX}#{day.isoformat()}"
        return self._hit(global_key, day_ttl) <= self._daily_max

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
    """FastAPI dependency that rejects rate-limited contact requests.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request, used to extract the client IP.

    Raises
    ------
    fastapi.HTTPException
        With status 429 when the per-IP or daily limit is exceeded, and
        503 when the rate-limit backend is unavailable (fail closed).
    """
    try:
        allowed = get_contact_limiter().is_allowed(client_ip(request))
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


def client_ip(request: Request) -> str:
    """Return the viewer IP used as the rate-limit key.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request.

    Returns
    -------
    str
        The CloudFront-set ``x-viewer-ip`` header when present, otherwise
        the socket peer address (local development), or ``"unknown"``.
    """
    viewer_ip = request.headers.get(_VIEWER_IP_HEADER, "").strip()
    if viewer_ip:
        return viewer_ip
    return request.client.host if request.client else "unknown"
