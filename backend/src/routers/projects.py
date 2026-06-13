"""Project endpoints: public reads, admin writes."""

from typing import Any

from fastapi import APIRouter, Depends, status

from src.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from src.services.project_service import ProjectService, get_project_service
from src.utils.auth import optional_admin, require_admin

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    category: str | None = None,
    technology: str | None = None,
    search: str | None = None,
    admin: dict[str, Any] | None = Depends(optional_admin),
    service: ProjectService = Depends(get_project_service),
) -> list[dict[str, Any]]:
    """List projects; anonymous callers only see published ones.

    Parameters
    ----------
    category : str, optional
        Exact category filter.
    technology : str, optional
        Technology id filter.
    search : str, optional
        Free-text search on title and description.
    admin : dict or None
        Admin claims when the caller is an authenticated administrator.
    service : ProjectService
        Injected project service.

    Returns
    -------
    list[dict[str, Any]]
        Matching projects.
    """
    return service.list_projects(
        category=category,
        technology=technology,
        search=search,
        include_unpublished=admin is not None,
    )


@router.get("/{slug}", response_model=ProjectResponse)
def get_project(
    slug: str,
    admin: dict[str, Any] | None = Depends(optional_admin),
    service: ProjectService = Depends(get_project_service),
) -> dict[str, Any]:
    """Fetch a single project by slug.

    Parameters
    ----------
    slug : str
        Project primary key.
    admin : dict or None
        Admin claims when present; drafts are hidden otherwise.
    service : ProjectService
        Injected project service.

    Returns
    -------
    dict[str, Any]
        The project item.
    """
    return service.get_project(slug, include_unpublished=admin is not None)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_project(
    payload: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
) -> dict[str, Any]:
    """Create a project (admin only).

    Parameters
    ----------
    payload : ProjectCreate
        New project content.
    service : ProjectService
        Injected project service.

    Returns
    -------
    dict[str, Any]
        The stored project item.
    """
    return service.create_project(payload)


@router.put(
    "/{slug}",
    response_model=ProjectResponse,
    dependencies=[Depends(require_admin)],
)
def update_project(
    slug: str,
    payload: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
) -> dict[str, Any]:
    """Replace a project (admin only).

    Parameters
    ----------
    slug : str
        Project primary key.
    payload : ProjectUpdate
        Replacement content.
    service : ProjectService
        Injected project service.

    Returns
    -------
    dict[str, Any]
        The stored project item.
    """
    return service.update_project(slug, payload)


@router.delete(
    "/{slug}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_project(
    slug: str,
    service: ProjectService = Depends(get_project_service),
) -> None:
    """Delete a project (admin only).

    Parameters
    ----------
    slug : str
        Project primary key.
    service : ProjectService
        Injected project service.
    """
    service.delete_project(slug)
