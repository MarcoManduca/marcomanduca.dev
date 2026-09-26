"""Unit tests for ProjectService against a moto-backed table."""

from collections.abc import Callable
from typing import Any
from unittest.mock import MagicMock

import pytest

from src.models.projects_table import ProjectsTable
from src.schemas.project import ProjectCreate, ProjectUpdate
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


def test_list_projects_tolerates_items_without_created_at(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange: a legacy item stored without a created_at timestamp.
    service.create_project(ProjectCreate(**project_payload_factory()))
    service._table.put_if_absent(
        {"slug": "legacy", "status": "published", "title": {"it": "L", "en": "L"}}
    )

    # Act
    items = service.list_projects(include_unpublished=True)

    # Assert
    assert {item["slug"] for item in items} == {"demo-project", "legacy"}


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


def test_list_projects_filters_by_category(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    other = project_payload_factory(
        title={"it": "Dati", "en": "Data Project"}, category="data"
    )
    service.create_project(ProjectCreate(**other))

    # Act
    items = service.list_projects(category="data")

    # Assert
    assert [item["slug"] for item in items] == ["data-project"]


def test_list_projects_filters_by_technology(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    service.create_project(ProjectCreate(**project_payload_factory()))
    other = project_payload_factory(
        title={"it": "React", "en": "React Project"}, technologies=["react"]
    )
    service.create_project(ProjectCreate(**other))

    # Act
    items = service.list_projects(technology="react")

    # Assert
    assert [item["slug"] for item in items] == ["react-project"]


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


def test_update_project_preserves_created_at(
    service: ProjectService,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    created = service.create_project(ProjectCreate(**project_payload_factory()))
    updated_payload = ProjectUpdate(**project_payload_factory(category="data"))

    # Act
    updated = service.update_project("demo-project", updated_payload)

    # Assert
    assert updated["category"] == "data"
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
