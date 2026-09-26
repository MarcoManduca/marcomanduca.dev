"""URL-safe slug generation."""

import re
import unicodedata

_NON_ALNUM = re.compile(r"[^a-z0-9]+")
# "+" and "#" only carry meaning when glued to a name ("C++", "C#", "F#"),
# so they are spelled out only right after a letter/digit (or another "+").
# A free-standing symbol ("A + B", "Tip #1") still collapses to a hyphen.
_PLUS_AFTER_WORD = re.compile(r"(?<=[A-Za-z0-9+])\+")
_SHARP_AFTER_WORD = re.compile(r"(?<=[A-Za-z0-9])#")


def slugify(text: str) -> str:
    """Convert arbitrary text into a URL-safe slug.

    ``+`` and ``#`` attached to a word are spelled out first (``"C++"``
    becomes ``"cplusplus"``, ``"C#"`` becomes ``"csharp"``) so such names
    do not collide with ``"C"``. Accents are then stripped (NFKD
    normalisation), the text is lowered and every run of non-alphanumeric
    characters becomes a single hyphen.

    Parameters
    ----------
    text : str
        Free-form text, for example a project title.

    Returns
    -------
    str
        Lowercase ASCII slug, possibly empty if no alphanumeric
        character survives normalisation.
    """
    spelled = _SHARP_AFTER_WORD.sub("sharp", _PLUS_AFTER_WORD.sub("plus", text))
    ascii_text = (
        unicodedata.normalize("NFKD", spelled).encode("ascii", "ignore").decode("ascii")
    )
    return _NON_ALNUM.sub("-", ascii_text.lower()).strip("-")
