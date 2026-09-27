"""Unit tests for seeding technologies."""

import json
from pathlib import Path

import pytest

from seed import seed as seeder
from src.services.technology_service import get_technology_service


def _names() -> list[str]:
    """Names of every registered technology."""
    technologies = get_technology_service().list_technologies()
    return sorted(technology["name"] for technology in technologies)


def test_seed_technologies_registers_the_real_file(
    aws_backend: None, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    content = [
        {"name": "Polars", "icon": "polars", "category": "data"},
        {"name": "React", "icon": "react", "category": "frontend"},
    ]
    (tmp_path / "technologies.json").write_text(json.dumps(content))
    monkeypatch.setattr(seeder, "DATA_DIR", tmp_path)

    # Act
    seeder.seed_technologies()
    seeder.seed_technologies()

    # Assert
    assert _names() == ["Polars", "React"]


def test_seed_technologies_skips_a_missing_file(
    aws_backend: None, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setattr(seeder, "DATA_DIR", tmp_path)

    # Act
    seeder.seed_technologies()

    # Assert
    assert _names() == []
