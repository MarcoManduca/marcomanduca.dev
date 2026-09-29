"""Unit tests for the environment-based settings."""

import pytest
from pydantic import ValidationError

from src.config import LogLevel, Settings


@pytest.mark.parametrize(
    ("raw", "expected"),
    [("info", LogLevel.INFO), ("Warning", LogLevel.WARNING), ("DEBUG", LogLevel.DEBUG)],
)
def test_log_level_accepts_any_case(
    monkeypatch: pytest.MonkeyPatch, raw: str, expected: LogLevel
) -> None:
    # Arrange
    monkeypatch.setenv("LOG_LEVEL", raw)

    # Act
    settings = Settings()

    # Assert
    assert settings.log_level is expected


def test_log_level_rejects_unknown_names(monkeypatch: pytest.MonkeyPatch) -> None:
    # Arrange
    monkeypatch.setenv("LOG_LEVEL", "verbose")

    # Act / Assert
    with pytest.raises(ValidationError, match="log_level"):
        Settings()


@pytest.mark.parametrize(
    ("variable", "value"),
    [
        ("CONTACT_RATE_LIMIT_MAX_REQUESTS", "0"),
        ("CONTACT_RATE_LIMIT_WINDOW_SECONDS", "0"),
        ("CONTACT_RATE_LIMIT_DAILY_MAX", "-1"),
        ("PRESIGN_EXPIRATION_SECONDS", "0"),
        ("PRESIGN_EXPIRATION_SECONDS", "604801"),
    ],
)
def test_numeric_settings_reject_out_of_range_values(
    monkeypatch: pytest.MonkeyPatch, variable: str, value: str
) -> None:
    # Arrange
    monkeypatch.setenv(variable, value)

    # Act / Assert
    with pytest.raises(ValidationError, match=variable.lower()):
        Settings()


def test_presign_expiration_accepts_the_sigv4_maximum(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    monkeypatch.setenv("PRESIGN_EXPIRATION_SECONDS", "604800")

    # Act
    settings = Settings()

    # Assert
    assert settings.presign_expiration_seconds == 604_800
