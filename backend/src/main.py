"""FastAPI application factory and wiring.

Registers JSON logging, CORS, the ``/api/v1`` routers and the domain-error
handlers. Rate limiting is applied as a dependency on the contact endpoint
(see ``src.utils.rate_limit``). In prod the interactive docs and the OpenAPI
schema are disabled and the settings in ``REQUIRED_IN_PROD`` (including the
CloudFront origin secret) are mandatory.
"""

import logging

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import ensure_prod_settings, get_settings
from src.routers import contact, health, learning, media, projects, technologies
from src.services.errors import (
    ConflictError,
    EmailDeliveryError,
    InvalidInputError,
    NotFoundError,
)
from src.utils.origin_verify import OriginVerifyMiddleware
from src.utils.structured_logging import configure_logging

API_PREFIX = "/api/v1"
# The Lambda Web Adapter readiness probe calls this from inside the
# execution environment, without the CloudFront origin header.
_READINESS_PROBE = ("GET", f"{API_PREFIX}/health")
# AWS error codes meaning "slow down": transient, so 503 + Retry-After
# (botocore timeouts and connection errors get the same answer).
_THROTTLING_CODES = frozenset(
    {
        "ThrottlingException",
        "ProvisionedThroughputExceededException",
        "RequestLimitExceeded",
        "Throttling",
        "SlowDown",
    }
)
_RETRY_AFTER_SECONDS = "1"

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Build the FastAPI application.

    Returns
    -------
    fastapi.FastAPI
        Configured application with CORS, routers and error handlers.

    Raises
    ------
    MissingSettingError
        When running in prod with a required setting left empty.
    """
    settings = get_settings()
    configure_logging(settings.log_level)
    ensure_prod_settings(settings)
    docs_enabled = not settings.is_prod
    app = FastAPI(
        title="marcomanduca.dev API",
        version="1.0.0",
        description="Backend for the marcomanduca.dev personal portfolio.",
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
    # Added last so it runs first: reject non-CDN traffic before anything else.
    app.add_middleware(
        OriginVerifyMiddleware,
        secret=settings.origin_verify_secret,
        previous_secret=settings.origin_verify_secret_previous,
        exempt=frozenset({_READINESS_PROBE}),
    )
    _register_routers(app)
    _register_error_handlers(app)
    return app


def _register_routers(app: FastAPI) -> None:
    """Mount every domain router under the API prefix."""
    api = APIRouter(prefix=API_PREFIX)
    api.include_router(health.router)
    api.include_router(projects.router)
    api.include_router(learning.router)
    api.include_router(technologies.router)
    api.include_router(contact.router)
    api.include_router(media.router)
    app.include_router(api)


def _register_error_handlers(app: FastAPI) -> None:
    """Map domain errors to HTTP responses."""

    @app.exception_handler(NotFoundError)
    async def handle_not_found(request: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)}
        )

    @app.exception_handler(ConflictError)
    async def handle_conflict(request: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT, content={"detail": str(exc)}
        )

    @app.exception_handler(InvalidInputError)
    async def handle_invalid_input(
        request: Request, exc: InvalidInputError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)}
        )

    @app.exception_handler(EmailDeliveryError)
    async def handle_email_delivery(
        request: Request, exc: EmailDeliveryError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ClientError)
    async def handle_aws_client_error(
        request: Request, exc: ClientError
    ) -> JSONResponse:
        # Safety net: never echo AWS error messages (they name tables/keys).
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        logger.error(
            "aws_client_error",
            extra={"error_code": code, "operation": exc.operation_name},
        )
        if code in _THROTTLING_CODES:
            return _service_busy()
        if code == "ValidationException":
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                content={"detail": "The request could not be processed."},
            )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"},
        )

    @app.exception_handler(BotoCoreError)
    async def handle_aws_connection_error(
        request: Request, exc: BotoCoreError
    ) -> JSONResponse:
        # Timeouts and connection failures never reached AWS (or got no
        # answer): transient, like throttling.
        logger.error("aws_connection_error", extra={"error_type": type(exc).__name__})
        return _service_busy()


def _service_busy() -> JSONResponse:
    """Build the 503 asking the client to retry shortly."""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "Service busy. Please try again shortly."},
        headers={"Retry-After": _RETRY_AFTER_SECONDS},
    )


app = create_app()
