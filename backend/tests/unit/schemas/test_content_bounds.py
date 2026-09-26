"""Unit tests for input length bounds on project and article schemas."""

from collections.abc import Callable
from typing import Any

import pytest
from pydantic import ValidationError

from src.schemas.common import (
    MARKDOWN_MAX_LENGTH,
    SUMMARY_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    URL_MAX_LENGTH,
)
from src.schemas.learning import ArticleCreate
from src.schemas.project import ProjectCreate

_LONG_URL = "https://example.com/" + "a" * URL_MAX_LENGTH


@pytest.mark.parametrize(
    "overrides",
    [
        {"title": {"it": "", "en": "Title"}},
        {"title": {"it": "T", "en": "x" * (TITLE_MAX_LENGTH + 1)}},
        {"description": {"it": "x" * (SUMMARY_MAX_LENGTH + 1), "en": "D"}},
        {"content_markdown": {"it": "M", "en": "x" * (MARKDOWN_MAX_LENGTH + 1)}},
        {"technologies": ["fastapi"] * 31},
        {"technologies": [""]},
        {"images": ["img.png"] * 21},
        {"images": ["x" * 1025]},
        {"github_url": _LONG_URL},
        {"demo_url": _LONG_URL},
    ],
)
def test_project_create_rejects_out_of_bounds_fields(
    project_payload_factory: Callable[..., dict[str, Any]],
    overrides: dict[str, Any],
) -> None:
    # Arrange
    payload = project_payload_factory(**overrides)

    # Act / Assert
    with pytest.raises(ValidationError):
        ProjectCreate(**payload)


def test_project_create_accepts_fields_at_their_maximum_length(
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    payload = project_payload_factory(
        title={"it": "x" * TITLE_MAX_LENGTH, "en": "x" * TITLE_MAX_LENGTH},
        content_markdown={"it": "x" * MARKDOWN_MAX_LENGTH, "en": "#"},
        technologies=["t"] * 30,
        images=["i"] * 20,
    )

    # Act
    project = ProjectCreate(**payload)

    # Assert
    assert len(project.content_markdown.it) == MARKDOWN_MAX_LENGTH


@pytest.mark.parametrize(
    "overrides",
    [
        {"title": {"it": "Titolo", "en": ""}},
        {"content_markdown": {"it": "", "en": "Body"}},
        {"tags": ["python"] * 21},
        {"tags": ["x" * 41]},
        {"tags": [""]},
    ],
)
def test_article_create_rejects_out_of_bounds_fields(
    article_payload_factory: Callable[..., dict[str, Any]],
    overrides: dict[str, Any],
) -> None:
    # Arrange
    payload = article_payload_factory(**overrides)

    # Act / Assert
    with pytest.raises(ValidationError):
        ArticleCreate(**payload)
