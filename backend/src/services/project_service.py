"""Business logic for portfolio projects."""

from functools import lru_cache
from typing import Any

from src.models.projects_table import ProjectsTable
from src.schemas.common import PublicationStatus
from src.schemas.project import ProjectCreate, ProjectUpdate
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.timestamps import utc_now_iso
from src.utils.slugify import slugify

_EMPTY_SLUG_MESSAGE = "Title must contain at least one alphanumeric character."


class ProjectService:
    """CRUD and filtering for projects.

    Parameters
    ----------
    table : ProjectsTable
        DynamoDB access layer for projects.
    """

    def __init__(self, table: ProjectsTable) -> None:
        self._table = table

    def list_projects(
        self,
        *,
        category: str | None = None,
        technology: str | None = None,
        search: str | None = None,
        include_unpublished: bool = False,
    ) -> list[dict[str, Any]]:
        """Return projects matching the given filters.

        Parameters
        ----------
        category : str, optional
            Exact category filter.
        technology : str, optional
            Technology id that must appear in ``technologies``.
        search : str, optional
            Case-insensitive substring matched against title and
            description in both languages.
        include_unpublished : bool
            When ``False`` (public callers), only published projects
            are returned.

        Returns
        -------
        list[dict[str, Any]]
            Matching projects, newest first.
        """
        items = self._table.scan_all()
        if not include_unpublished:
            items = [
                item
                for item in items
                if item.get("status") == PublicationStatus.PUBLISHED.value
            ]
        if category:
            items = [item for item in items if item.get("category") == category]
        if technology:
            items = [
                item for item in items if technology in item.get("technologies", [])
            ]
        if search:
            items = [item for item in items if _matches_search(item, search)]
        return sorted(items, key=lambda item: item.get("created_at", ""), reverse=True)

    def get_project(
        self, slug: str, *, include_unpublished: bool = False
    ) -> dict[str, Any]:
        """Fetch one project by slug.

        Parameters
        ----------
        slug : str
            Project primary key.
        include_unpublished : bool
            When ``False``, non-published projects behave as missing.

        Returns
        -------
        dict[str, Any]
            The project item.

        Raises
        ------
        NotFoundError
            When the project is missing or not visible to the caller.
        """
        item = self._table.get(slug)
        if item is None:
            raise NotFoundError(f"Project '{slug}' not found.")
        is_published = item.get("status") == PublicationStatus.PUBLISHED.value
        if not include_unpublished and not is_published:
            raise NotFoundError(f"Project '{slug}' not found.")
        return item

    def create_project(self, payload: ProjectCreate) -> dict[str, Any]:
        """Create a project; the slug derives from the English title.

        Parameters
        ----------
        payload : ProjectCreate
            Validated project content.

        Returns
        -------
        dict[str, Any]
            The stored project item.

        Raises
        ------
        ConflictError
            When the derived slug already exists.
        InvalidInputError
            When the English title yields an empty slug.
        """
        slug = slugify(payload.title.en)
        if not slug:
            raise InvalidInputError(_EMPTY_SLUG_MESSAGE)
        now = utc_now_iso()
        item = payload.model_dump(mode="json") | {
            "slug": slug,
            "created_at": now,
            "updated_at": now,
        }
        if not self._table.put_if_absent(item):
            raise ConflictError(f"Project '{slug}' already exists.")
        return item

    def update_project(self, slug: str, payload: ProjectUpdate) -> dict[str, Any]:
        """Replace an existing project, preserving ``created_at``.

        Parameters
        ----------
        slug : str
            Project primary key.
        payload : ProjectUpdate
            New project content.

        Returns
        -------
        dict[str, Any]
            The stored project item.

        Raises
        ------
        NotFoundError
            When the project does not exist.
        """
        existing = self._table.get(slug)
        if existing is None:
            raise NotFoundError(f"Project '{slug}' not found.")
        item = payload.model_dump(mode="json") | {
            "slug": slug,
            "created_at": existing["created_at"],
            "updated_at": utc_now_iso(),
        }
        if not self._table.replace_if_exists(item):
            raise NotFoundError(f"Project '{slug}' not found.")
        return item

    def delete_project(self, slug: str) -> None:
        """Delete a project by slug.

        Parameters
        ----------
        slug : str
            Project primary key.

        Raises
        ------
        NotFoundError
            When the project does not exist.
        """
        if not self._table.delete_if_exists(slug):
            raise NotFoundError(f"Project '{slug}' not found.")


def _matches_search(item: dict[str, Any], search: str) -> bool:
    """Check a case-insensitive match on title/description (it/en)."""
    needle = search.lower()
    haystacks = [
        *item.get("title", {}).values(),
        *item.get("description", {}).values(),
    ]
    return any(needle in str(text).lower() for text in haystacks)


@lru_cache
def get_project_service() -> ProjectService:
    """Return the cached :class:`ProjectService`.

    Built once per execution environment so boto3 objects are reused
    across requests; tests clear it with ``cache_clear()``.

    Returns
    -------
    ProjectService
        Shared service instance.
    """
    return ProjectService(ProjectsTable())
