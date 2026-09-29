"""Unit tests for the JSON log formatter and logging setup."""

import json
import logging
from collections.abc import Iterator

import pytest

from src.utils.structured_logging import JsonFormatter, configure_logging

_SERVER_LOGGERS = ("uvicorn", "uvicorn.error", "uvicorn.access")


@pytest.fixture
def app_logger() -> Iterator[logging.Logger]:
    """Yield the ``src`` logger; restore it and the uvicorn loggers after."""
    names = ("src", *_SERVER_LOGGERS)
    loggers = [logging.getLogger(name) for name in names]
    saved = [(list(lg.handlers), lg.level, lg.propagate) for lg in loggers]
    yield loggers[0]
    for lg, (handlers, level, propagate) in zip(loggers, saved, strict=True):
        lg.handlers, lg.level, lg.propagate = handlers, level, propagate


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


@pytest.mark.parametrize("name", _SERVER_LOGGERS)
def test_configure_logging_writes_uvicorn_records_once_as_json(
    app_logger: logging.Logger, capsys: pytest.CaptureFixture[str], name: str
) -> None:
    # Arrange
    configure_logging("INFO")
    server_logger = logging.getLogger(name)
    server_logger.setLevel(logging.INFO)

    # Act
    server_logger.error("boom", extra={"color_message": "\x1b[31mboom\x1b[0m"})

    # Assert
    lines = capsys.readouterr().out.splitlines()
    assert len(lines) == 1
    entry = json.loads(lines[0])
    assert entry["logger"] == name
    assert "color_message" not in entry
