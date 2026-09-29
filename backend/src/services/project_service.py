"""Business logic for portfolio projects."""

from functools import lru_cache
from typing import Any

from src.models.projects_table import ProjectsTable
from src.schemas.common import PublicationStatus
from src.schemas.project import (
    ProjectCard,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from src.schemas.project_taxonomy import (
    LinkKind,
    ProjectArea,
    ProjectContext,
)
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.parsing import parse_item, parse_items
from src.services.timestamps import utc_now_iso
from src.utils.slugify import slugify

_INVALID_SHAPE_EVENT = "project_invalid_shape"

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
        area: ProjectArea | None = None,
        context: ProjectContext | None = None,
        technology: str | None = None,
        search: str | None = None,
        include_unpublished: bool = False,
    ) -> list[dict[str, Any]]:
        """Return the cards of the projects matching the given filters.

        Parameters
        ----------
        area : ProjectArea, optional
            Area the project must be listed under.
        context : ProjectContext, optional
            Exact context filter.
        technology : str, optional
            Technology name that must appear in ``technologies``.
        search : str, optional
            Case-insensitive substring matched against title, description
            and topics in both languages.
        include_unpublished : bool
            When ``False`` (public callers), only published projects
            are returned.

        Returns
        -------
        list[dict[str, Any]]
            Matching project cards, newest first.
        """
        projects = parse_items(
            ProjectResponse,
            self._table.scan_all(),
            key="slug",
            event=_INVALID_SHAPE_EVENT,
        )
        if not include_unpublished:
            projects = [
                project
                for project in projects
                if project.status is PublicationStatus.PUBLISHED
            ]
        if area:
            projects = [project for project in projects if area in project.areas]
        if context:
            projects = [project for project in projects if project.context is context]
        if technology:
            projects = [
                project for project in projects if technology in project.technologies
            ]
        if search:
            projects = [
                project for project in projects if _matches_search(project, search)
            ]
        projects.sort(key=lambda project: project.created_at, reverse=True)
        return [_to_card(project) for project in projects]

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
            The full project.

        Raises
        ------
        NotFoundError
            When the project is missing, not visible to the caller, or
            stored in a shape the current schema cannot read.
        """
        item = self._table.get(slug)
        project = (
            parse_item(ProjectResponse, item, key="slug", event=_INVALID_SHAPE_EVENT)
            if item is not None
            else None
        )
        if project is None:
            raise NotFoundError(f"Project '{slug}' not found.")
        is_published = project.status is PublicationStatus.PUBLISHED
        if not include_unpublished and not is_published:
            raise NotFoundError(f"Project '{slug}' not found.")
        return project.model_dump(mode="json")

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
        existing = self._table.get(slug, consistent=True)
        if existing is None:
            raise NotFoundError(f"Project '{slug}' not found.")
        now = utc_now_iso()
        item = payload.model_dump(mode="json") | {
            "slug": slug,
            # Items written before created_at existed get it now.
            "created_at": existing.get("created_at") or now,
            "updated_at": now,
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


def _to_card(project: ProjectResponse) -> dict[str, Any]:
    """Project the fields a card shows, plus its first repository link."""
    repo_url = next(
        (link.url for link in project.links if link.kind is LinkKind.REPO), None
    )
    card = ProjectCard.model_validate(project.model_dump() | {"repo_url": repo_url})
    return card.model_dump(mode="json")


def _matches_search(project: ProjectResponse, search: str) -> bool:
    """Check a case-insensitive match on title, description and topics."""
    needle = search.lower()
    texts = [project.title, project.description, *project.topics]
    return any(needle in text.it.lower() or needle in text.en.lower() for text in texts)


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
