"""Business logic for learning articles, including versioning."""

from functools import lru_cache
from typing import Any

from src.models.learning_table import LearningTable
from src.schemas.common import PublicationStatus
from src.schemas.learning import ArticleCreate, ArticleUpdate, LearningCategory
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.timestamps import utc_now_iso
from src.utils.slugify import slugify

_FIRST_VERSION = 1
_MAX_WRITE_RETRIES = 5
_EMPTY_SLUG_MESSAGE = "Title must contain at least one alphanumeric character."


class LearningService:
    """CRUD, filtering and version management for articles.

    Every update writes a new item with an incremented ``version`` sort
    key; rollback restores an old version as a brand-new latest
    version, so history is never rewritten.

    Parameters
    ----------
    table : LearningTable
        DynamoDB access layer for learning articles.
    """

    def __init__(self, table: LearningTable) -> None:
        self._table = table

    def list_articles(
        self,
        *,
        category: LearningCategory | None = None,
        tag: str | None = None,
        include_unpublished: bool = False,
    ) -> list[dict[str, Any]]:
        """Return the latest version of each article, filtered.

        Parameters
        ----------
        category : LearningCategory, optional
            Exact category filter.
        tag : str, optional
            Tag that must appear in the article tags.
        include_unpublished : bool
            When ``False`` (public callers), only published articles
            are returned.

        Returns
        -------
        list[dict[str, Any]]
            Latest article versions, newest first.
        """
        latest_by_slug: dict[str, dict[str, Any]] = {}
        for item in self._table.scan_all():
            current = latest_by_slug.get(item["slug"])
            if current is None or item["version"] > current["version"]:
                latest_by_slug[item["slug"]] = item
        items = list(latest_by_slug.values())
        if not include_unpublished:
            items = [
                item
                for item in items
                if item.get("status") == PublicationStatus.PUBLISHED.value
            ]
        if category:
            items = [item for item in items if item.get("category") == category.value]
        if tag:
            items = [item for item in items if tag in item.get("tags", [])]
        return sorted(items, key=lambda item: item.get("updated_at", ""), reverse=True)

    def get_article(
        self, slug: str, *, include_unpublished: bool = False
    ) -> dict[str, Any]:
        """Fetch the latest version of an article.

        Parameters
        ----------
        slug : str
            Article partition key.
        include_unpublished : bool
            When ``False``, non-published articles behave as missing.

        Returns
        -------
        dict[str, Any]
            The latest version item.

        Raises
        ------
        NotFoundError
            When the article is missing or not visible to the caller.
        """
        item = self._table.get_latest(slug)
        if item is None:
            raise NotFoundError(f"Article '{slug}' not found.")
        is_published = item.get("status") == PublicationStatus.PUBLISHED.value
        if not include_unpublished and not is_published:
            raise NotFoundError(f"Article '{slug}' not found.")
        return item

    def list_versions(self, slug: str) -> list[dict[str, Any]]:
        """Return all stored versions of an article, newest first.

        Parameters
        ----------
        slug : str
            Article partition key.

        Returns
        -------
        list[dict[str, Any]]
            Version items in descending version order.

        Raises
        ------
        NotFoundError
            When no version exists for the slug.
        """
        versions = self._table.list_versions(slug)
        if not versions:
            raise NotFoundError(f"Article '{slug}' not found.")
        return versions

    def create_article(self, payload: ArticleCreate) -> dict[str, Any]:
        """Create an article as version 1.

        Parameters
        ----------
        payload : ArticleCreate
            Validated article content.

        Returns
        -------
        dict[str, Any]
            The stored version-1 item.

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
            "version": _FIRST_VERSION,
            "created_at": now,
            "updated_at": now,
        }
        if not self._table.put_version_if_absent(item):
            raise ConflictError(f"Article '{slug}' already exists.")
        return item

    def update_article(self, slug: str, payload: ArticleUpdate) -> dict[str, Any]:
        """Store the payload as a new latest version.

        Parameters
        ----------
        slug : str
            Article partition key.
        payload : ArticleUpdate
            New article content.

        Returns
        -------
        dict[str, Any]
            The newly stored version item.

        Raises
        ------
        NotFoundError
            When the article does not exist.
        ConflictError
            When concurrent writers keep claiming the next version.
        """
        for _ in range(_MAX_WRITE_RETRIES):
            latest = self._table.get_latest(slug)
            if latest is None:
                raise NotFoundError(f"Article '{slug}' not found.")
            item = payload.model_dump(mode="json") | {
                "slug": slug,
                "version": latest["version"] + 1,
                "created_at": latest["created_at"],
                "updated_at": utc_now_iso(),
            }
            if self._table.put_version_if_absent(item):
                return item
        raise ConflictError(f"Article '{slug}' is being updated concurrently.")

    def rollback_article(self, slug: str, version: int) -> dict[str, Any]:
        """Restore an old version as a new latest version.

        Parameters
        ----------
        slug : str
            Article partition key.
        version : int
            Existing version number to restore.

        Returns
        -------
        dict[str, Any]
            The newly stored version item carrying the old content.

        Raises
        ------
        NotFoundError
            When the article or the requested version does not exist.
        ConflictError
            When concurrent writers keep claiming the next version.
        """
        target = self._table.get_version(slug, version)
        if target is None:
            raise NotFoundError(f"Version {version} of article '{slug}' not found.")
        for _ in range(_MAX_WRITE_RETRIES):
            latest = self._table.get_latest(slug)
            if latest is None:
                raise NotFoundError(f"Article '{slug}' not found.")
            item = dict(target) | {
                "version": latest["version"] + 1,
                "updated_at": utc_now_iso(),
            }
            if self._table.put_version_if_absent(item):
                return item
        raise ConflictError(f"Article '{slug}' is being updated concurrently.")

    def delete_article(self, slug: str) -> None:
        """Delete every version of an article.

        Parameters
        ----------
        slug : str
            Article partition key.

        Raises
        ------
        NotFoundError
            When the article does not exist.
        """
        deleted = self._table.delete_all_versions(slug)
        if deleted == 0:
            raise NotFoundError(f"Article '{slug}' not found.")


@lru_cache
def get_learning_service() -> LearningService:
    """Return the cached :class:`LearningService`.

    Built once per execution environment so boto3 objects are reused
    across requests; tests clear it with ``cache_clear()``.

    Returns
    -------
    LearningService
        Shared service instance.
    """
    return LearningService(LearningTable())
