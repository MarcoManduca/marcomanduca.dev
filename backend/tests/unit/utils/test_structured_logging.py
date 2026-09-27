"""Unit tests for the JSON log formatter and logging setup."""

import json
import logging
from collections.abc import Iterator

import pytest

from src.utils.structured_logging import JsonFormatter, configure_logging


@pytest.fixture
def app_logger() -> Iterator[logging.Logger]:
    """Yield the ``src`` logger and restore its handlers and level after."""
    logger = logging.getLogger("src")
    saved = (list(logger.handlers), logger.level)
    yield logger
    logger.handlers, logger.level = saved[0], saved[1]


def _record(message: str = "aws_client_error", **kwargs: object) -> logging.LogRecord:
    """Build an error record as ``logger.error(message, ...)`` would."""
    return logging.getLogger("src.test").makeRecord(
        name="src.test",
        level=logging.ERROR,
        fn=__file__,
        lno=1,
        msg=message,
        args=None,
        exc_info=kwargs.pop("exc_info", None),  # type: ignore[arg-type]
        extra=kwargs,
    )


def test_json_formatter_keeps_the_extra_fields() -> None:
    # Act
    entry = json.loads(JsonFormatter().format(_record(error_code="Throttling")))

    # Assert
    assert entry["message"] == "aws_client_error"
    assert entry["level"] == "ERROR"
    assert entry["logger"] == "src.test"
    assert entry["error_code"] == "Throttling"


def test_json_formatter_leaves_out_the_standard_record_attributes() -> None:
    # Act
    entry = json.loads(JsonFormatter().format(_record()))

    # Assert
    assert set(entry) == {"timestamp", "level", "logger", "message"}


def test_json_formatter_includes_the_exception() -> None:
    # Arrange
    error = ValueError("boom")
    record = _record("failed", exc_info=(ValueError, error, None))

    # Act
    entry = json.loads(JsonFormatter().format(record))

    # Assert
    assert "ValueError: boom" in entry["exception"]


def test_configure_logging_writes_app_records_as_json_lines(
    app_logger: logging.Logger, capsys: pytest.CaptureFixture[str]
) -> None:
    # Arrange
    configure_logging("INFO")

    # Act
    logging.getLogger("src.services.demo").info("seeded", extra={"count": 3})

    # Assert
    entry = json.loads(capsys.readouterr().out)
    assert entry["message"] == "seeded"
    assert entry["count"] == 3


def test_configure_logging_does_not_stack_handlers(
    app_logger: logging.Logger,
) -> None:
    # Act
    configure_logging("INFO")
    configure_logging("WARNING")

    # Assert
    assert len(app_logger.handlers) == 1
    assert app_logger.level == logging.WARNING
