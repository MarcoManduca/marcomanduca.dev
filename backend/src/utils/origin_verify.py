"""CloudFront origin verification.

The backend sits behind an API Gateway HTTP API whose default endpoint is
publicly reachable. CloudFront injects a shared secret in the
``X-Origin-Verify`` header on every request it forwards, so the application
can reject anything that did not arrive through the CDN (including forged
``x-viewer-ip`` headers used for rate limiting). The secret is mandatory in
prod; locally an empty secret disables the check.
"""

import hmac
from collections.abc import Awaitable, Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from src.config import Settings

_HEADER = "x-origin-verify"


class MissingOriginSecretError(RuntimeError):
    """Raised at startup when prod runs without an origin-verify secret."""


def ensure_origin_secret(settings: Settings) -> None:
    """Refuse to run in prod without an origin-verify secret (fail secure).

    Parameters
    ----------
    settings : Settings
        Application settings.

    Raises
    ------
    MissingOriginSecretError
        When ``app_env`` is prod and ``origin_verify_secret`` is empty.
    """
    if settings.is_prod and not settings.origin_verify_secret:
        raise MissingOriginSecretError(
            "ORIGIN_VERIFY_SECRET must be set when APP_ENV=prod."
        )


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
        self._secret = secret.encode()

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Forward the request only when the secret matches (or is disabled).

        Parameters
        ----------
        request : fastapi.Request
            Incoming request.
        call_next : Callable
            Next ASGI handler in the chain.

        Returns
        -------
        fastapi.Response
            The downstream response, or 403 when the secret is wrong.
        """
        if self._secret and not self._matches(request):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Forbidden"},
            )
        return await call_next(request)

    def _matches(self, request: Request) -> bool:
        """Compare the header to the secret in constant time."""
        provided = request.headers.get(_HEADER, "").encode()
        return hmac.compare_digest(provided, self._secret)
