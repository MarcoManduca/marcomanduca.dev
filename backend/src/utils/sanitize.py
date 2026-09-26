"""Text sanitisation helpers for untrusted input placed in emails."""

import unicodedata


def strip_control_chars(text: str) -> str:
    """Remove CR, LF, tabs and every other Unicode control/format character.

    Used on single-line values (such as a sender name) that end up in an
    email subject or header-like line, where a newline could forge extra
    lines.

    Parameters
    ----------
    text : str
        Untrusted input.

    Returns
    -------
    str
        The text without characters of Unicode category ``C*``, with
        surrounding whitespace stripped.
    """
    kept = (char for char in text if not unicodedata.category(char).startswith("C"))
    return "".join(kept).strip()


def truncate(text: str, max_length: int) -> str:
    """Cut text to at most ``max_length`` characters, marking the cut.

    Parameters
    ----------
    text : str
        Text to shorten.
    max_length : int
        Maximum length of the result, ellipsis included (must be >= 1).

    Returns
    -------
    str
        The original text when short enough, otherwise its prefix
        followed by a single ellipsis character.
    """
    if len(text) <= max_length:
        return text
    return f"{text[: max_length - 1]}…"
