"""Learning article endpoints, including version management."""

from typing import Any

from fastapi import APIRouter, Depends, status

from src.schemas.learning import (
    ArticleCreate,
    ArticleResponse,
    ArticleUpdate,
    ArticleVersionInfo,
    LearningCategory,
    RollbackRequest,
)
from src.services.learning_service import LearningService, get_learning_service
from src.utils.auth import optional_admin, require_admin

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("", response_model=list[ArticleResponse])
def list_articles(
    category: LearningCategory | None = None,
    tag: str | None = None,
    admin: dict[str, Any] | None = Depends(optional_admin),
    service: LearningService = Depends(get_learning_service),
) -> list[ArticleResponse]:
    """List the latest version of each article.

    Parameters
    ----------
    category : LearningCategory, optional
        Category filter.
    tag : str, optional
        Tag filter.
    admin : dict or None
        Admin claims when present; drafts are hidden otherwise.
    service : LearningService
        Injected learning service.

    Returns
    -------
    list[ArticleResponse]
        Matching latest article versions.
    """
    return service.list_articles(
        category=category,
        tag=tag,
        include_unpublished=admin is not None,
    )


@router.get("/{slug}", response_model=ArticleResponse)
def get_article(
    slug: str,
    admin: dict[str, Any] | None = Depends(optional_admin),
    service: LearningService = Depends(get_learning_service),
) -> ArticleResponse:
    """Fetch the latest version of an article.

    Parameters
    ----------
    slug : str
        Article partition key.
    admin : dict or None
        Admin claims when present; drafts are hidden otherwise.
    service : LearningService
        Injected learning service.

    Returns
    -------
    ArticleResponse
        Latest article version.
    """
    return service.get_article(slug, include_unpublished=admin is not None)


@router.get(
    "/{slug}/versions",
    response_model=list[ArticleVersionInfo],
    dependencies=[Depends(require_admin)],
)
def list_article_versions(
    slug: str,
    service: LearningService = Depends(get_learning_service),
) -> list[dict[str, Any]]:
    """List all stored versions of an article (admin only).

    Parameters
    ----------
    slug : str
        Article partition key.
    service : LearningService
        Injected learning service.

    Returns
    -------
    list[dict[str, Any]]
        Version descriptors, newest first.
    """
    return service.list_versions(slug)


@router.post(
    "/{slug}/rollback",
    response_model=ArticleResponse,
    dependencies=[Depends(require_admin)],
)
def rollback_article(
    slug: str,
    payload: RollbackRequest,
    service: LearningService = Depends(get_learning_service),
) -> dict[str, Any]:
    """Restore an old version as a new latest version (admin only).

    Parameters
    ----------
    slug : str
        Article partition key.
    payload : RollbackRequest
        Version number to restore.
    service : LearningService
        Injected learning service.

    Returns
    -------
    dict[str, Any]
        The newly written latest version.
    """
    return service.rollback_article(slug, payload.version)


@router.post(
    "",
    response_model=ArticleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_article(
    payload: ArticleCreate,
    service: LearningService = Depends(get_learning_service),
) -> dict[str, Any]:
    """Create an article as version 1 (admin only).

    Parameters
    ----------
    payload : ArticleCreate
        New article content.
    service : LearningService
        Injected learning service.

    Returns
    -------
    dict[str, Any]
        The stored version-1 item.
    """
    return service.create_article(payload)


@router.put(
    "/{slug}",
    response_model=ArticleResponse,
    dependencies=[Depends(require_admin)],
)
def update_article(
    slug: str,
    payload: ArticleUpdate,
    service: LearningService = Depends(get_learning_service),
) -> dict[str, Any]:
    """Store a new version of an article (admin only).

    Parameters
    ----------
    slug : str
        Article partition key.
    payload : ArticleUpdate
        New article content.
    service : LearningService
        Injected learning service.

    Returns
    -------
    dict[str, Any]
        The newly stored version item.
    """
    return service.update_article(slug, payload)


@router.delete(
    "/{slug}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_article(
    slug: str,
    service: LearningService = Depends(get_learning_service),
) -> None:
    """Delete an article with all its versions (admin only).

    Parameters
    ----------
    slug : str
        Article partition key.
    service : LearningService
        Injected learning service.
    """
    service.delete_article(slug)
