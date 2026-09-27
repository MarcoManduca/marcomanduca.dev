"""Structured JSON logging for the application.

Without a configured handler, Python's last-resort handler printed only the
message text of warnings and errors, so the context passed through
``extra=`` (error codes, slugs) never reached CloudWatch, and info records
were dropped. Each record is now one JSON line on stdout, which CloudWatch
Logs Insights parses into fields.

Callers pass only non-sensitive context in ``extra`` (ids, error classes,
counts), never PII or payloads.
"""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

# Attributes every LogRecord carries; anything else came from ``extra=``.
_RECORD_ATTRIBUTES = frozenset(
    set(vars(logging.LogRecord("", 0, "", 0, "", None, None))) | {"message", "asctime"}
)


class JsonFormatter(logging.Formatter):
    """Render a log record as a single JSON object.

    The object holds the timestamp, level, logger name, message, every
    ``extra`` field and, when present, the formatted exception.
    """

    def format(self, record: logging.LogRecord) -> str:
        """Serialise ``record`` to a JSON line.

        Parameters
        ----------
        record : logging.LogRecord
            The record to render.

        Returns
        -------
        str
            One-line JSON document.
        """
        entry: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        entry |= {
            key: value
            for key, value in vars(record).items()
            if key not in _RECORD_ATTRIBUTES
        }
        if record.exc_info:
            entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(entry, default=str)


def configure_logging(level: str = "INFO") -> None:
    """Send the ``src`` loggers to stdout as JSON lines.

    Idempotent: calling it again (e.g. one app per test) replaces the
    handler instead of stacking duplicates.

    Parameters
    ----------
    level : str
        Minimum level name for application loggers, e.g. ``"INFO"``.
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    app_logger = logging.getLogger("src")
    app_logger.handlers = [handler]
    app_logger.setLevel(level)
