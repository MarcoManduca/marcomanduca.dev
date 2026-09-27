"""URL checks shared by the content schemas."""

_ALLOWED_URL_SCHEMES = ("http://", "https://")


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
