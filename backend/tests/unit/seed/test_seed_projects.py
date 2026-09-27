"""Unit tests for seeding projects, including ``--replace`` and ``--demo``."""

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

import pytest

from seed import seed as seeder
from src.schemas.common import TITLE_MAX_LENGTH
from src.services.project_service import get_project_service


@pytest.fixture
def project_file(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> Callable[..., None]:
    """Point the seeder at a temporary data folder and write one project."""
    projects = tmp_path / "projects"
    projects.mkdir()
    monkeypatch.setattr(seeder, "DATA_DIR", tmp_path)

    def _write(name: str = "demo.json", **overrides: Any) -> None:
        payload = project_payload_factory(**overrides)
        (projects / name).write_text(json.dumps(payload), encoding="utf-8")

    return _write


def _slugs() -> list[str]:
    """Slugs of every stored project, drafts included."""
    projects = get_project_service().list_projects(include_unpublished=True)
    return sorted(project["slug"] for project in projects)


def test_seed_projects_skips_an_existing_project(
    aws_backend: None, project_file: Callable[..., None]
) -> None:
    # Arrange
    project_file(context="personal")
    seeder.seed_projects(demo=False)
    project_file(context="work")

    # Act
    seeder.seed_projects(demo=False)

    # Assert
    project = get_project_service().get_project("demo-project")
    assert project["context"] == "personal"


def test_seed_projects_replaces_an_existing_project_on_request(
    aws_backend: None, project_file: Callable[..., None]
) -> None:
    # Arrange
    project_file(context="personal")
    seeder.seed_projects(demo=False)
    created_at = get_project_service().get_project("demo-project")["created_at"]
    project_file(context="work")

    # Act
    seeder.seed_projects(demo=False, replace=True)

    # Assert
    project = get_project_service().get_project("demo-project")
    assert project["context"] == "work"
    assert project["created_at"] == created_at


def test_seed_projects_loads_the_real_projects_without_demo(
    aws_backend: None, project_file: Callable[..., None]
) -> None:
    # Arrange
    project_file()
    project_file("_template.json", title={"it": "Modello", "en": "Template"})

    # Act
    seeder.seed_projects(demo=False)

    # Assert
    assert _slugs() == ["demo-project"]


def test_seed_projects_loads_only_demo_copies_of_real_projects_with_demo(
    aws_backend: None, project_file: Callable[..., None]
) -> None:
    # Arrange
    project_file()
    project_file("_template.json", title={"it": "Modello", "en": "Template"})

    # Act
    seeder.seed_projects(demo=True)

    # Assert
    copy = get_project_service().get_project("demo-demo-project")
    assert _slugs() == ["demo-demo-project"]
    assert copy["title"] == {"it": "DEMO · Progetto Demo", "en": "DEMO · Demo Project"}
    assert copy["context"] == "personal"


def test_seed_projects_rejects_a_demo_copy_whose_title_gets_too_long(
    aws_backend: None, project_file: Callable[..., None]
) -> None:
    # Arrange
    title = "x" * TITLE_MAX_LENGTH
    project_file(title={"it": title, "en": title})

    # Act / Assert
    with pytest.raises(SystemExit, match="demo.json"):
        seeder.seed_projects(demo=True)
