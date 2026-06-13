"""Technology catalogue endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, status

from src.schemas.technology import TechnologyCreate, TechnologyResponse
from src.services.technology_service import (
    TechnologyService,
    get_technology_service,
)
from src.utils.auth import require_admin

router = APIRouter(prefix="/technologies", tags=["technologies"])


@router.get("", response_model=list[TechnologyResponse])
def list_technologies(
    service: TechnologyService = Depends(get_technology_service),
) -> list[dict[str, Any]]:
    """List all technologies (public).

    Parameters
    ----------
    service : TechnologyService
        Injected technology service.

    Returns
    -------
    list[dict[str, Any]]
        Technologies sorted by name.
    """
    return service.list_technologies()


@router.post(
    "",
    response_model=TechnologyResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_technology(
    payload: TechnologyCreate,
    service: TechnologyService = Depends(get_technology_service),
) -> dict[str, Any]:
    """Register a technology (admin only).

    Parameters
    ----------
    payload : TechnologyCreate
        New technology content.
    service : TechnologyService
        Injected technology service.

    Returns
    -------
    dict[str, Any]
        The stored technology item.
    """
    return service.create_technology(payload)


@router.delete(
    "/{tech_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_technology(
    tech_id: str,
    service: TechnologyService = Depends(get_technology_service),
) -> None:
    """Delete a technology (admin only).

    Parameters
    ----------
    tech_id : str
        Technology primary key.
    service : TechnologyService
        Injected technology service.
    """
    service.delete_technology(tech_id)
