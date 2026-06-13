"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def get_health() -> dict[str, str]:
    """Report service liveness.

    Returns
    -------
    dict[str, str]
        ``{"status": "ok"}`` when the service is up.
    """
    return {"status": "ok"}
