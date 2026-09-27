"""Unit tests for project schema validation."""

from collections.abc import Callable
from typing import Any

import pytest
from pydantic import ValidationError

from src.schemas.project import ProjectCreate


def _lab(**overrides: Any) -> dict[str, Any]:
    """A valid image-compare lab with one sample and one layer."""
    layer = {
        "id": "predicted",
        "label": {"it": "IR previsto", "en": "Predicted IR"},
        "src": "https://cdn.example.com/predicted.png",
        "alt": {"it": "IR previsto", "en": "Predicted IR"},
        "description": {"it": "Cosa prevede il modello", "en": "What it predicts"},
    }
    sample = {
        "id": "gt01",
        "label": {"it": "GT01", "en": "GT01"},
        "base": {
            "src": "https://cdn.example.com/rgb.png",
            "alt": {"it": "Foto", "en": "Photo"},
        },
        "layers": [layer],
    }
    lab: dict[str, Any] = {"model": "resunet_nll", "samples": [sample]}
    lab.update(overrides)
    return lab


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


def test_project_create_leaves_optional_sections_empty(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    project = ProjectCreate(**project_payload_factory())

    # Assert
    assert project.lab is None
    assert project.cover is None
    assert project.quest is None
    assert project.media == []


@pytest.mark.parametrize(
    "overrides",
    [
        {"status": "hidden"},
        {"title": {"en": "Only English"}},
        {"areas": []},
        {"areas": ["data", "ml", "dl", "ai"]},
        {"areas": ["data", "data"]},
        {"areas": ["fullstack"]},
        {"context": "community"},
        {"brief": {"objective": {"it": "O", "en": "O"}}},
        {"license": None},
        {"license": ""},
        {"quest": "study-2025-13"},
        {"quest": "hobby-2025-09"},
    ],
)
def test_project_create_rejects_invalid_classification(
    project_payload_factory: Callable[..., dict[str, Any]],
    overrides: dict[str, Any],
) -> None:
    # Arrange
    payload = project_payload_factory(**overrides)

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_requires_a_license(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory()
    payload.pop("license")

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_accepts_three_areas_and_a_quest_anchor(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(
        areas=["frontend", "backend", "cloud"], quest="study-2025-09"
    )

    # Act
    project = ProjectCreate(**payload)

    # Assert
    assert [area.value for area in project.areas] == ["frontend", "backend", "cloud"]
    assert project.quest == "study-2025-09"


def test_project_create_rejects_non_http_link(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(
        links=[{"kind": "live", "url": "javascript:alert(1)"}]
    )

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_rejects_unknown_link_kind(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(
        links=[{"kind": "blog", "url": "https://example.com"}]
    )

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_accepts_a_lab(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    project = ProjectCreate(**project_payload_factory(lab=_lab()))

    # Assert
    assert project.lab is not None
    assert project.lab.kind.value == "image-compare"
    assert project.lab.samples[0].layers[0].id == "predicted"


def test_project_create_rejects_a_lab_without_samples(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(lab=_lab(samples=[]))

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_rejects_repeated_lab_ids(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    lab = _lab()
    sample = lab["samples"][0]
    sample["layers"] = [sample["layers"][0], sample["layers"][0]]

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**project_payload_factory(lab=lab))


def test_project_create_rejects_repeated_sample_ids(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    lab = _lab()
    lab["samples"] = [lab["samples"][0], lab["samples"][0]]

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**project_payload_factory(lab=lab))


def test_project_create_rejects_an_invalid_lab_id(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    lab = _lab()
    lab["samples"][0]["id"] = "GT 01"

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**project_payload_factory(lab=lab))
