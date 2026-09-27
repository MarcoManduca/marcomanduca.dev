"""Unit tests for the seeder entry point: target checks and errors."""

import json
from pathlib import Path

import pytest
from moto import mock_aws

from seed import seed as seeder
from src.config import get_settings

_LOCAL_ENDPOINT = "http://localhost:8001"


@pytest.fixture
def seeded(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, bool]]:
    """Replace the seeding steps with a recorder of their flags."""
    calls: list[dict[str, bool]] = []
    monkeypatch.setattr(seeder, "_seed_all", lambda **flags: calls.append(flags))
    return calls


def _use_endpoint(monkeypatch: pytest.MonkeyPatch, endpoint: str) -> None:
    """Point the settings at a DynamoDB endpoint."""
    monkeypatch.setenv("DYNAMODB_ENDPOINT_URL", endpoint)
    get_settings.cache_clear()


def test_main_refuses_demo_content_without_a_local_endpoint(
    seeded: list[dict[str, bool]],
) -> None:
    # Act / Assert
    with pytest.raises(SystemExit, match="DYNAMODB_ENDPOINT_URL"):
        seeder.main(["--demo"])
    assert seeded == []


def test_main_seeds_demo_content_into_dynamodb_local(
    seeded: list[dict[str, bool]],
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    # Arrange
    _use_endpoint(monkeypatch, _LOCAL_ENDPOINT)

    # Act
    seeder.main(["--demo", "--replace"])

    # Assert
    assert seeded == [{"demo": True, "replace": True}]
    assert f"into DynamoDB Local {_LOCAL_ENDPOINT}" in capsys.readouterr().out


def test_main_names_aws_as_the_target_of_real_content(
    seeded: list[dict[str, bool]], capsys: pytest.CaptureFixture[str]
) -> None:
    # Act
    seeder.main([])

    # Assert
    assert seeded == [{"demo": False, "replace": False}]
    assert "real content into AWS eu-west-1" in capsys.readouterr().out


def test_main_explains_a_missing_table(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    content = [{"name": "Polars", "icon": "polars", "category": "data"}]
    (tmp_path / "technologies.json").write_text(json.dumps(content))
    monkeypatch.setattr(seeder, "DATA_DIR", tmp_path)

    # Act / Assert
    with mock_aws(), pytest.raises(SystemExit, match="dynamodb-init"):
        seeder.main([])
