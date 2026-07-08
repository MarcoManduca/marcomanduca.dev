"""CloudFront origin verification.

The backend runs on a public Lambda Function URL. CloudFront injects a shared
secret in the ``X-Origin-Verify`` header on every request it forwards, so the
function can reject anything that did not arrive through the CDN. The check is
skipped when the secret is empty (local development and tests).
"""

from collections.abc import Awaitable, Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

_HEADER = "x-origin-verify"


class OriginVerifyMiddleware(BaseHTTPMiddleware):
    """Reject requests missing the expected ``X-Origin-Verify`` secret.

    Parameters
    ----------
    app : Any
        The wrapped ASGI application.
    secret : str
        Expected header value. An empty string disables the check.
    """

    def __init__(self, app: object, secret: str) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self._secret = secret

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Forward the request only when the secret matches (or is disabled)."""
        if self._secret and request.headers.get(_HEADER) != self._secret:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Forbidden"},
            )
        return await call_next(request)
