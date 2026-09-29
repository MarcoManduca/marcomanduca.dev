"""Business logic for learning articles, including versioning."""

import time
from collections.abc import Callable
from functools import lru_cache
from typing import Any

from src.models.learning_table import LearningTable
from src.schemas.common import PublicationStatus
from src.schemas.learning import (
    ArticleCreate,
    ArticleResponse,
    ArticleUpdate,
    LearningCategory,
)
from src.services.backoff import backoff_delay
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.parsing import parse_item, parse_items
from src.services.timestamps import utc_now_iso
from src.utils.slugify import slugify

_FIRST_VERSION = 1
_MAX_WRITE_RETRIES = 5
_EMPTY_SLUG_MESSAGE = "Title must contain at least one alphanumeric character."
_INVALID_SHAPE_EVENT = "article_invalid_shape"


class LearningService:
    """CRUD, filtering and version management for articles.

    Every update writes a new item with an incremented ``version`` sort
    key; rollback restores an old version as a brand-new latest
    version, so history is never rewritten.

    Parameters
    ----------
    table : LearningTable
        DynamoDB access layer for learning articles.
    sleep : Callable[[float], None], optional
        Waits between retries of a contended write (``time.sleep``);
        tests pass a no-op.
    """

    def __init__(
        self, table: LearningTable, sleep: Callable[[float], None] = time.sleep
    ) -> None:
        self._table = table
        self._sleep = sleep

    def list_articles(
        self,
        *,
        category: LearningCategory | None = None,
        tag: str | None = None,
        include_unpublished: bool = False,
    ) -> list[ArticleResponse]:
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
        list[ArticleResponse]
            Latest article versions, newest first. A latest version stored
            in an outdated shape is left out (and logged) rather than
            failing the whole list.
        """
        latest_by_slug: dict[str, dict[str, Any]] = {}
        for item in self._table.scan_all():
            current = latest_by_slug.get(item["slug"])
            if current is None or item["version"] > current["version"]:
                latest_by_slug[item["slug"]] = item
        articles = parse_items(
            ArticleResponse,
            latest_by_slug.values(),
            key="slug",
            event=_INVALID_SHAPE_EVENT,
        )
        if not include_unpublished:
            articles = [a for a in articles if a.status is PublicationStatus.PUBLISHED]
        if category:
            articles = [a for a in articles if a.category is category]
        if tag:
            articles = [a for a in articles if tag in a.tags]
        return sorted(articles, key=lambda article: article.updated_at, reverse=True)

    def get_article(
        self, slug: str, *, include_unpublished: bool = False
    ) -> ArticleResponse:
        """Fetch the latest version of an article.

        Parameters
        ----------
        slug : str
            Article partition key.
        include_unpublished : bool
            When ``False``, non-published articles behave as missing.

        Returns
        -------
        ArticleResponse
            The latest version.

        Raises
        ------
        NotFoundError
            When the article is missing, not visible to the caller, or its
            latest version is stored in a shape the schema cannot read.
        """
        item = self._table.get_latest(slug)
        article = (
            parse_item(ArticleResponse, item, key="slug", event=_INVALID_SHAPE_EVENT)
            if item is not None
            else None
        )
        if article is None:
            raise NotFoundError(f"Article '{slug}' not found.")
        is_published = article.status is PublicationStatus.PUBLISHED
        if not include_unpublished and not is_published:
            raise NotFoundError(f"Article '{slug}' not found.")
        return article

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
            When the derived slug already exists (at any version).
        InvalidInputError
            When the English title yields an empty slug.
        """
        slug = slugify(payload.title.en)
        if not slug:
            raise InvalidInputError(_EMPTY_SLUG_MESSAGE)
        # Version 1 alone is not enough to tell: it may be gone while later
        # versions (or a delete in progress) still hold the slug.
        if self._table.get_latest(slug, consistent=True) is not None:
            raise ConflictError(f"Article '{slug}' already exists.")
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
        for attempt in range(_MAX_WRITE_RETRIES):
            self._pause_before(attempt)
            latest = self._table.get_latest(slug, consistent=True)
            if latest is None:
                raise NotFoundError(f"Article '{slug}' not found.")
            now = utc_now_iso()
            item = payload.model_dump(mode="json") | {
                "slug": slug,
                "version": latest["version"] + 1,
                "created_at": latest.get("created_at") or now,
                "updated_at": now,
            }
            if self._table.append_version(item, previous=latest["version"]):
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
        InvalidInputError
            When the version is stored in a shape the current schema cannot
            read, so restoring it would break the article.
        ConflictError
            When concurrent writers keep claiming the next version.
        """
        target = self._table.get_version(slug, version, consistent=True)
        if target is None:
            raise NotFoundError(f"Version {version} of article '{slug}' not found.")
        if (
            parse_item(ArticleResponse, target, key="slug", event=_INVALID_SHAPE_EVENT)
            is None
        ):
            raise InvalidInputError(
                f"Version {version} of article '{slug}' no longer matches the "
                "article schema and cannot be restored."
            )
        for attempt in range(_MAX_WRITE_RETRIES):
            self._pause_before(attempt)
            latest = self._table.get_latest(slug, consistent=True)
            if latest is None:
                raise NotFoundError(f"Article '{slug}' not found.")
            item = dict(target) | {
                "version": latest["version"] + 1,
                "updated_at": utc_now_iso(),
            }
            if self._table.append_version(item, previous=latest["version"]):
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
        ConflictError
            When concurrent updates keep appending versions.
        """
        for attempt in range(_MAX_WRITE_RETRIES):
            self._pause_before(attempt)
            deleted = self._table.delete_all_versions(slug)
            # Nothing left on a retry: a concurrent delete finished the job.
            if deleted == 0 and attempt == 0:
                raise NotFoundError(f"Article '{slug}' not found.")
            if deleted is not None:
                return
        raise ConflictError(f"Article '{slug}' is being updated concurrently.")

    def _pause_before(self, attempt: int) -> None:
        """Back off before every retry (not before the first attempt)."""
        if attempt:
            self._sleep(backoff_delay(attempt))


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
