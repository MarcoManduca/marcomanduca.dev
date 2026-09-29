"""Plain-text excerpts of markdown content.

A port of the frontend helper (``frontend/src/utils/excerpt.ts``) with the
same rules, so the Learning cards read the same whether the excerpt comes
from the API or is computed in the browser. Keep the two in sync.
"""

import re

DEFAULT_LENGTH = 160
_ELLIPSIS = "…"

# Ordered markdown -> plain text rewrites (images before links).
_MARKDOWN_RULES: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"```[^\n]*\n?"), " "),  # code fence markers (code is kept)
    (re.compile(r"!\[[^\]]*\]\([^)]*\)"), " "),  # images: dropped entirely
    (re.compile(r"\[([^\]]*)\]\([^)]*\)"), r"\1"),  # links: keep the text
    (re.compile(r"^\s{0,3}#{1,6}\s+", re.MULTILINE), ""),  # heading markers
    (re.compile(r"^\s{0,3}>\s?", re.MULTILINE), ""),  # blockquote markers
    (re.compile(r"^\s*(?:[-*+]|\d+\.)\s+", re.MULTILINE), ""),  # list markers
    (re.compile(r"^\s*(?:[-*_]\s*){3,}$", re.MULTILINE), " "),  # horizontal rules
    (re.compile(r"[*~`]"), ""),  # emphasis, strikethrough and inline code
    # _emphasis_, not snake_case: [^\W_] is a letter or a digit.
    (re.compile(r"(?<![^\W_])_+|_+(?![^\W_])"), ""),
)
_WHITESPACE = re.compile(r"\s+")


def excerpt(markdown: str, length: int = DEFAULT_LENGTH) -> str:
    """Build a short plain-text excerpt from markdown content.

    Strips the most common markdown syntax (keeping link text and dropping
    images), collapses whitespace and truncates to ``length`` characters
    with an ellipsis when needed. Hyphens and underscores inside words are
    preserved.

    Parameters
    ----------
    markdown : str
        Markdown source.
    length : int
        Maximum number of characters before the ellipsis.

    Returns
    -------
    str
        The excerpt: at most ``length`` characters, plus ``"…"`` when the
        text was cut.
    """
    text = markdown
    for pattern, replacement in _MARKDOWN_RULES:
        text = pattern.sub(replacement, text)
    text = _WHITESPACE.sub(" ", text).strip()
    if len(text) <= length:
        return text
    return f"{text[:length].rstrip()}{_ELLIPSIS}"
