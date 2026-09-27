"""Unit tests for LearningService versioning and filtering."""

from collections.abc import Callable
from typing import Any
from unittest.mock import MagicMock

import pytest

from src.models.learning_table import LearningTable
from src.schemas.learning import ArticleCreate, ArticleUpdate, LearningCategory
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.learning_service import LearningService


@pytest.fixture
def service(aws_backend: None) -> LearningService:
    """Learning service bound to the moto-backed table."""
    return LearningService(LearningTable())


def test_create_article_stores_version_one(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = ArticleCreate(**article_payload_factory())

    # Act
    item = service.create_article(payload)

    # Assert
    assert item["slug"] == "demo-article"
    assert item["version"] == 1


def test_create_article_raises_conflict_on_duplicate_slug(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = ArticleCreate(**article_payload_factory())
    service.create_article(payload)

    # Act / Assert
    with pytest.raises(ConflictError):
        service.create_article(payload)


def test_create_article_raises_invalid_input_on_empty_slug(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    overrides = article_payload_factory(title={"it": "中文", "en": "!!!"})
    payload = ArticleCreate(**overrides)

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_article(payload)


def test_update_article_raises_conflict_when_version_is_contended(
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange: a table whose conditional write always loses the race.
    table = MagicMock()
    table.get_latest.return_value = {"version": 1, "created_at": "t"}
    table.put_version_if_absent.return_value = False
    service = LearningService(table)
    update = ArticleUpdate(**article_payload_factory())

    # Act / Assert
    with pytest.raises(ConflictError):
        service.update_article("demo-article", update)


def test_update_article_writes_a_new_version(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    update = ArticleUpdate(**article_payload_factory(tags=["python", "aws"]))

    # Act
    item = service.update_article("demo-article", update)

    # Assert
    assert item["version"] == 2
    assert item["tags"] == ["python", "aws"]


def test_get_article_returns_latest_version(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    update = ArticleUpdate(**article_payload_factory(tags=["updated"]))
    service.update_article("demo-article", update)

    # Act
    item = service.get_article("demo-article")

    # Assert
    assert item.version == 2
    assert item.tags == ["updated"]


def test_get_article_raises_not_found_on_missing_slug(
    service: LearningService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_article("missing")


def test_get_article_hides_draft_from_public_callers(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory(status="draft")))

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_article("demo-article", include_unpublished=False)


def test_list_versions_returns_versions_newest_first(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    service.update_article("demo-article", ArticleUpdate(**article_payload_factory()))

    # Act
    versions = service.list_versions("demo-article")

    # Assert
    assert [item["version"] for item in versions] == [2, 1]


def test_list_versions_raises_not_found_on_missing_slug(
    service: LearningService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.list_versions("missing")


def test_rollback_article_restores_old_content_as_new_version(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory(tags=["original"])))
    service.update_article(
        "demo-article",
        ArticleUpdate(**article_payload_factory(tags=["changed"])),
    )

    # Act
    restored = service.rollback_article("demo-article", 1)

    # Assert
    assert restored["version"] == 3
    assert restored["tags"] == ["original"]


def test_rollback_article_raises_not_found_on_missing_version(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.rollback_article("demo-article", 99)


def test_list_articles_returns_only_latest_versions(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    service.update_article("demo-article", ArticleUpdate(**article_payload_factory()))

    # Act
    items = service.list_articles(include_unpublished=True)

    # Assert
    assert len(items) == 1
    assert items[0].version == 2


def test_list_articles_excludes_drafts_for_public_callers(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    draft = article_payload_factory(
        title={"it": "Bozza", "en": "Draft Note"}, status="draft"
    )
    service.create_article(ArticleCreate(**draft))
    service.create_article(ArticleCreate(**article_payload_factory()))

    # Act
    items = service.list_articles(include_unpublished=False)

    # Assert
    assert [item.slug for item in items] == ["demo-article"]


def test_list_articles_filters_by_category_and_tag(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    cloud = article_payload_factory(
        title={"it": "Nuvola", "en": "Cloud Note"},
        category="Cloud",
        tags=["aws"],
    )
    service.create_article(ArticleCreate(**cloud))
    service.create_article(ArticleCreate(**article_payload_factory()))

    # Act
    items = service.list_articles(
        category=LearningCategory.CLOUD, tag="aws", include_unpublished=True
    )

    # Assert
    assert [item.slug for item in items] == ["cloud-note"]


def test_delete_article_removes_all_versions(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    service.update_article("demo-article", ArticleUpdate(**article_payload_factory()))

    # Act
    service.delete_article("demo-article")

    # Assert
    with pytest.raises(NotFoundError):
        service.list_versions("demo-article")


def test_delete_article_raises_not_found_on_missing_slug(
    service: LearningService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.delete_article("missing")


def _store_raw_version(
    article_payload_factory: Callable[..., dict[str, Any]], **overrides: Any
) -> None:
    """Store a version as an older release could have, bypassing validation.

    An override set to ``None`` leaves that attribute out entirely.
    """
    item = article_payload_factory() | {
        "slug": "legacy-note",
        "version": 1,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z",
    }
    stored = {
        key: value for key, value in (item | overrides).items() if value is not None
    }
    LearningTable().put_version_if_absent(stored)


# 41 characters: over the current 40-character tag limit.
_LEGACY_TAGS = ["x" * 41]


def test_list_articles_skips_a_latest_version_in_an_older_shape(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_article(ArticleCreate(**article_payload_factory()))
    _store_raw_version(article_payload_factory, tags=_LEGACY_TAGS)

    # Act
    items = service.list_articles(include_unpublished=True)

    # Assert
    assert [item.slug for item in items] == ["demo-article"]


def test_get_article_treats_an_older_shape_as_missing(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    _store_raw_version(article_payload_factory, tags=_LEGACY_TAGS)

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_article("legacy-note", include_unpublished=True)


def test_rollback_article_refuses_a_version_in_an_older_shape(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange: v1 predates the tag limit, v2 is current.
    _store_raw_version(article_payload_factory, tags=_LEGACY_TAGS)
    _store_raw_version(article_payload_factory, version=2)

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.rollback_article("legacy-note", 1)


def test_update_article_sets_created_at_when_the_stored_item_has_none(
    service: LearningService,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    _store_raw_version(article_payload_factory, created_at=None)
    payload = ArticleUpdate(**article_payload_factory())

    # Act
    item = service.update_article("legacy-note", payload)

    # Assert
    assert item["created_at"] == item["updated_at"]
