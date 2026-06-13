"""Unit tests for project schema validation."""

from collections.abc import Callable
from typing import Any

import pytest
from pydantic import ValidationError

from src.schemas.project import ProjectCreate


def test_project_create_defaults_to_draft_status(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory()
    payload.pop("status")

    # Act
    project = ProjectCreate(**payload)

    # Assert
    assert project.status.value == "draft"


def test_project_create_rejects_unknown_status(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(status="hidden")

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_requires_both_title_languages(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(title={"en": "Only English"})

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)
