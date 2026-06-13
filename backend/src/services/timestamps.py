"""UTC timestamp helper shared by write paths."""

from datetime import UTC, datetime


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string.

    Returns
    -------
    str
        Timestamp such as ``"2026-06-12T10:00:00+00:00"``.
    """
    return datetime.now(UTC).isoformat()
