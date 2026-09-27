"""URL checks shared by the content schemas."""

import re

_ALLOWED_URL_SCHEMES = ("http://", "https://")
# A path on the site itself (``/images/…``), never ``//host`` or ``/\host``.
_SITE_PATH = re.compile(r"^/(?![/\\])")
# Browsers strip tabs and newlines from URLs, so ``/\t/host`` would load
# ``//host``; no whitespace or control character is ever legitimate here.
_SPACE_OR_CONTROL = re.compile(r"[\s\x00-\x1f\x7f]")


def require_http_url(value: str | None) -> str | None:
    """Reject URLs that do not use an ``http(s)`` scheme.

    Parameters
    ----------
    value : str or None
        Candidate URL.

    Returns
    -------
    str or None
        The unchanged value when valid (or ``None``).

    Raises
    ------
    ValueError
        When a non-empty value does not start with ``http://`` or
        ``https://`` (blocks ``javascript:`` and similar schemes).
    """
    if value and not value.startswith(_ALLOWED_URL_SCHEMES):
        raise ValueError("URL must use the http or https scheme.")
    return value


def require_media_ref(value: str) -> str:
    """Accept an http(s) URL or a path on the site itself.

    It mirrors what the frontend is willing to load (``safeMediaUrl``), so
    a value it would drop is rejected when written instead.

    Parameters
    ----------
    value : str
        Candidate image or media source.

    Returns
    -------
    str
        The unchanged value when valid.

    Raises
    ------
    ValueError
        When the value holds whitespace or control characters, or is
        neither an ``http(s)`` URL nor a site path starting with a single
        ``/`` (blocks ``javascript:``, ``data:`` and ``//host``).
    """
    if _SPACE_OR_CONTROL.search(value):
        raise ValueError("Media reference must not contain spaces or controls.")
    if _SITE_PATH.match(value) or value.startswith(_ALLOWED_URL_SCHEMES):
        return value
    raise ValueError("Media reference must be an http(s) URL or a /site path.")
