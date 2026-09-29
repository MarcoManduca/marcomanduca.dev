"""Unit tests for ProjectService against a moto-backed table."""

from collections.abc import Callable
from typing import Any
from unittest.mock import MagicMock

import pytest

from src.models.projects_table import ProjectsTable
from src.schemas.project import ProjectCreate, ProjectUpdate
from src.schemas.project_taxonomy import ProjectArea, ProjectContext
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.project_service import ProjectService


@pytest.fixture
def service(aws_backend: None) -> ProjectService:
    """Project service bound to the moto-backed table."""
    return ProjectService(ProjectsTable())


def test_create_project_returns_item_with_derived_slug(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = ProjectCreate(**project_payload_factory())

    # Act
    item = service.create_project(payload)

    # Assert
    assert item["slug"] == "demo-project"
    assert item["created_at"] == item["updated_at"]


def test_create_project_raises_conflict_on_duplicate_slug(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = ProjectCreate(**project_payload_factory())
    service.create_project(payload)

    # Act / Assert
    with pytest.raises(ConflictError):
        service.create_project(payload)


def test_create_project_raises_invalid_input_on_empty_slug(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    overrides = project_payload_factory(title={"it": "中文", "en": "!!!"})
    payload = ProjectCreate(**overrides)

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_project(payload)


def _store_legacy_item(service: ProjectService) -> None:
    """Store a project in the first schema (category, github_url, images)."""
    service._table.put_if_absent(
        {
            "slug": "legacy",
            "status": "published",
            "title": {"it": "L", "en": "Legacy"},
            "description": {"it": "D", "en": "D"},
            "category": "data",
            "github_url": "https://github.com/marco/legacy",
            "images": [],
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z",
        }
    )


def test_list_projects_skips_items_stored_in_an_older_shape(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    _store_legacy_item(service)

    # Act
    items = service.list_projects(include_unpublished=True)

    # Assert
    assert [item["slug"] for item in items] == ["demo-project"]


def test_get_project_treats_an_older_shape_as_missing(
    service: ProjectService,
) -> None:
    # Arrange
    _store_legacy_item(service)

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_project("legacy", include_unpublished=True)


def test_get_project_drops_the_retired_kind_of_a_stored_item(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    item = {
        **ProjectCreate(**project_payload_factory()).model_dump(mode="json"),
        "slug": "demo-project",
        "kind": "app",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z",
    }
    service._table.put_if_absent(item)

    # Act
    project = service.get_project("demo-project")

    # Assert
    assert "kind" not in project
    assert project["areas"] == ["backend"]


def test_list_projects_returns_light_cards(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))

    # Act
    [card] = service.list_projects()

    # Assert
    assert card["repo_url"] == "https://github.com/marco/demo"
    assert card["areas"] == ["backend"]
    assert card["metrics"][0]["value"] == "3"
    assert card["updated_at"] == card["created_at"]
    assert not {"content_markdown", "brief", "links", "media", "lab"} & set(card)


def test_list_projects_leaves_repo_url_empty_without_a_repository(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(
        links=[{"kind": "paper", "url": "https://example.com/paper.pdf"}]
    )
    service.create_project(ProjectCreate(**payload))

    # Act
    [card] = service.list_projects()

    # Assert
    assert card["repo_url"] is None


def test_get_project_returns_stored_item(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))

    # Act
    item = service.get_project("demo-project")

    # Assert
    assert item["title"]["en"] == "Demo Project"


def test_get_project_raises_not_found_on_missing_slug(
    service: ProjectService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_project("missing")


def test_get_project_hides_draft_from_public_callers(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory(status="draft")))

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.get_project("demo-project", include_unpublished=False)


def test_list_projects_excludes_drafts_for_public_callers(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    draft = project_payload_factory(
        title={"it": "Bozza", "en": "Draft Project"}, status="draft"
    )
    service.create_project(ProjectCreate(**draft))

    # Act
    items = service.list_projects(include_unpublished=False)

    # Assert
    assert [item["slug"] for item in items] == ["demo-project"]


def test_list_projects_includes_drafts_for_admin_callers(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory(status="draft")))

    # Act
    items = service.list_projects(include_unpublished=True)

    # Assert
    assert len(items) == 1


@pytest.mark.parametrize(
    ("overrides", "filters"),
    [
        ({"areas": ["ml", "data"]}, {"area": ProjectArea.DATA}),
        ({"context": "work"}, {"context": ProjectContext.WORK}),
        ({"technologies": ["react"]}, {"technology": "react"}),
    ],
)
def test_list_projects_filters_by_classification(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
    overrides: dict[str, Any],
    filters: dict[str, Any],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    other = project_payload_factory(
        title={"it": "Altro", "en": "Other Project"}, **overrides
    )
    service.create_project(ProjectCreate(**other))

    # Act
    items = service.list_projects(**filters)

    # Assert
    assert [item["slug"] for item in items] == ["other-project"]


def test_list_projects_searches_title_and_description(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    other = project_payload_factory(
        title={"it": "Pipeline", "en": "Pipeline Tool"},
        description={"it": "ETL serverless", "en": "Serverless ETL"},
    )
    service.create_project(ProjectCreate(**other))

    # Act
    items = service.list_projects(search="serverless etl")

    # Assert
    assert [item["slug"] for item in items] == ["pipeline-tool"]


def test_list_projects_searches_topics(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    other = project_payload_factory(
        title={"it": "Dipinti", "en": "Paintings"},
        topics=[{"it": "beni culturali", "en": "cultural heritage"}],
    )
    service.create_project(ProjectCreate(**other))

    # Act
    items = service.list_projects(search="Beni Culturali")

    # Assert
    assert [item["slug"] for item in items] == ["paintings"]


def test_update_project_preserves_created_at(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    created = service.create_project(ProjectCreate(**project_payload_factory()))
    updated_payload = ProjectUpdate(**project_payload_factory(context="work"))

    # Act
    updated = service.update_project("demo-project", updated_payload)

    # Assert
    assert updated["context"] == "work"
    assert updated["created_at"] == created["created_at"]


def test_update_project_raises_not_found_on_missing_slug(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = ProjectUpdate(**project_payload_factory())

    # Act / Assert
    with pytest.raises(NotFoundError):
        service.update_project("missing", payload)


def test_delete_project_removes_item(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))

    # Act
    service.delete_project("demo-project")

    # Assert
    with pytest.raises(NotFoundError):
        service.get_project("demo-project", include_unpublished=True)


def test_delete_project_raises_not_found_on_missing_slug(
    service: ProjectService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.delete_project("missing")


def test_update_project_raises_not_found_when_deleted_concurrently(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange: the read sees the project, the conditional write does not.
    table = MagicMock(spec=ProjectsTable)
    table.get.return_value = {"slug": "demo-project", "created_at": "2026-01-01"}
    table.replace_if_exists.return_value = False
    payload = ProjectUpdate(**project_payload_factory())

    # Act / Assert
    with pytest.raises(NotFoundError):
        ProjectService(table).update_project("demo-project", payload)


def test_update_project_reads_the_stored_project_consistently(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    table = MagicMock(spec=ProjectsTable)
    table.get.return_value = {"slug": "demo-project", "created_at": "2026-01-01"}
    table.replace_if_exists.return_value = True
    payload = ProjectUpdate(**project_payload_factory())

    # Act
    ProjectService(table).update_project("demo-project", payload)

    # Assert
    table.get.assert_called_once_with("demo-project", consistent=True)


def test_update_project_does_not_recreate_a_deleted_project(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    item = project_payload_factory() | {"slug": "demo-project"}
    service._table.delete_if_exists("demo-project")

    # Act
    written = service._table.replace_if_exists(item)

    # Assert
    assert written is False
    assert service._table.get("demo-project") is None


def test_delete_project_uses_a_single_conditional_delete() -> None:
    # Arrange
    table = MagicMock(spec=ProjectsTable)
    table.delete_if_exists.return_value = True

    # Act
    ProjectService(table).delete_project("demo-project")

    # Assert
    table.delete_if_exists.assert_called_once_with("demo-project")
    table.get.assert_not_called()


def test_update_project_sets_created_at_when_the_stored_item_has_none(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange: an item written before created_at was recorded.
    stored = ProjectCreate(**project_payload_factory()).model_dump(mode="json")
    service._table.put_if_absent(
        stored | {"slug": "demo-project", "updated_at": "2026-01-01T00:00:00Z"}
    )

    # Act
    updated = service.update_project(
        "demo-project", ProjectUpdate(**project_payload_factory())
    )

    # Assert
    assert updated["created_at"] == updated["updated_at"]
