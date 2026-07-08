"""DynamoDB-backed fixed-window rate limiting.

State lives in a small DynamoDB table with a TTL attribute instead of in
process memory, so the limit is shared across every Lambda execution
environment and survives cold starts. Each request atomically increments a
per-key, per-window counter; DynamoDB drops the item automatically once its
window has elapsed (TTL). This replaces the earlier per-instance in-memory
limiter, which reset on every cold start and could not be shared.
"""

import time
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, Request, status

from src.config import get_settings
from src.models.base import get_dynamodb_resource

# Small grace added to the TTL so an item never expires mid-window.
_TTL_GRACE_SECONDS = 60


class DynamoRateLimiter:
    """Fixed-window request counter stored in DynamoDB.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource with a string hash key ``pk``
        and a numeric TTL attribute ``expires_at``.
    max_requests : int
        Maximum number of requests allowed inside a single window.
    window_seconds : int
        Length of the fixed window in seconds.
    """

    def __init__(self, table: Any, max_requests: int, window_seconds: int) -> None:
        self._table = table
        self._max_requests = max_requests
        self._window_seconds = window_seconds

    def is_allowed(self, key: str, now: float | None = None) -> bool:
        """Record a hit for ``key`` and report whether it is allowed.

        Fails open: if DynamoDB is unreachable the request is allowed, so a
        transient backend fault never blocks a genuine visitor (the honeypot
        remains the second line of defence against spam).

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
            ``True`` if the request fits in the window, ``False`` otherwise.
        """
        current = time.time() if now is None else now
        window_start = int(current // self._window_seconds) * self._window_seconds
        try:
            response = self._table.update_item(
                Key={"pk": f"{key}#{window_start}"},
                UpdateExpression=(
                    "ADD hits :one SET expires_at = if_not_exists(expires_at, :ttl)"
                ),
                ExpressionAttributeValues={
                    ":one": 1,
                    ":ttl": window_start + self._window_seconds + _TTL_GRACE_SECONDS,
                },
                ReturnValues="UPDATED_NEW",
            )
        except (ClientError, BotoCoreError):
            return True
        return int(response["Attributes"]["hits"]) <= self._max_requests


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
        With status 429 when the per-IP limit is exceeded.
    """
    if not get_contact_limiter().is_allowed(_client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )


def _client_ip(request: Request) -> str:
    """Extract the originating client IP from a request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
