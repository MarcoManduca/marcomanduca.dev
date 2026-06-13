"""In-memory sliding-window rate limiting.

The limiter is intentionally per-instance: state lives in process memory
and is not shared across replicas. This is acceptable for a low-traffic
portfolio backend; production hardening can move the limit to API
Gateway throttling or AWS WAF rate-based rules.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from src.config import get_settings


class SlidingWindowRateLimiter:
    """Sliding-window request counter keyed by an arbitrary string.

    Parameters
    ----------
    max_requests : int
        Maximum number of requests allowed inside the window.
    window_seconds : float
        Length of the sliding window in seconds.
    """

    def __init__(self, max_requests: int, window_seconds: float) -> None:
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def is_allowed(self, key: str, now: float | None = None) -> bool:
        """Record a hit for ``key`` and report whether it is allowed.

        Parameters
        ----------
        key : str
            Identifier of the caller (typically a client IP).
        now : float, optional
            Monotonic timestamp override, used by tests to control the
            clock. Defaults to ``time.monotonic()``.

        Returns
        -------
        bool
            ``True`` if the request fits in the window, ``False`` if
            the caller exceeded the limit.
        """
        current = time.monotonic() if now is None else now
        bucket = self._hits[key]
        while bucket and current - bucket[0] >= self._window_seconds:
            bucket.popleft()
        if len(bucket) >= self._max_requests:
            return False
        bucket.append(current)
        return True

    def reset(self) -> None:
        """Drop all recorded hits."""
        self._hits.clear()


_contact_limiter: SlidingWindowRateLimiter | None = None


def get_contact_limiter() -> SlidingWindowRateLimiter:
    """Return the lazily-built limiter for the contact endpoint.

    Returns
    -------
    SlidingWindowRateLimiter
        Process-wide limiter configured from settings.
    """
    global _contact_limiter
    if _contact_limiter is None:
        settings = get_settings()
        _contact_limiter = SlidingWindowRateLimiter(
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
