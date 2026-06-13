"""FastAPI application factory and wiring.

Registers CORS, the ``/api/v1`` routers and the domain-error handlers.
Rate limiting is applied as a dependency on the contact endpoint (see
``src.utils.rate_limit``).
"""

from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import get_settings
from src.routers import contact, health, learning, media, projects, technologies
from src.services.errors import ConflictError, InvalidInputError, NotFoundError

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    """Build the FastAPI application.

    Returns
    -------
    fastapi.FastAPI
        Configured application with CORS, routers and error handlers.
    """
    settings = get_settings()
    app = FastAPI(
        title="marcomanduca.dev API",
        version="1.0.0",
        description="Backend for the marcomanduca.dev personal portfolio.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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


app = create_app()
