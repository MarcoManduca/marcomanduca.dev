"""CloudFront origin verification.

The backend sits behind an API Gateway HTTP API whose default endpoint is
publicly reachable. CloudFront injects a shared secret in the
``X-Origin-Verify`` header on every request it forwards, so the application
can reject anything that did not arrive through the CDN (including forged
``x-viewer-ip`` headers used for rate limiting). The secret is mandatory in
prod (``src.config.ensure_prod_settings``); locally an empty secret disables
the check.

During a rotation the previous secret is accepted too, so edges that have
not picked up the new header value yet keep working.
"""

import hmac
from collections.abc import Awaitable, Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

_HEADER = "x-origin-verify"


class OriginVerifyMiddleware(BaseHTTPMiddleware):
    """Reject requests missing the expected ``X-Origin-Verify`` secret.

    Parameters
    ----------
    app : starlette.types.ASGIApp
        The wrapped ASGI application.
    secret : str
        Expected header value. An empty string disables the check.
    previous_secret : str, optional
        Former value, still accepted while a rotation propagates.
    """

    def __init__(self, app: ASGIApp, secret: str, previous_secret: str = "") -> None:
        super().__init__(app)
        accepted = (secret, previous_secret) if secret else ()
        self._secrets = [value.encode() for value in accepted if value]

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
        if self._secrets and not self._matches(request):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Forbidden"},
            )
        return await call_next(request)

    def _matches(self, request: Request) -> bool:
        """Compare the header to each accepted secret in constant time."""
        provided = request.headers.get(_HEADER, "").encode()
        # No short-circuit: every accepted secret is compared.
        results = [hmac.compare_digest(provided, value) for value in self._secrets]
        return any(results)
