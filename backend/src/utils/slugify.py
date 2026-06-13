"""URL-safe slug generation."""

import re
import unicodedata

_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    """Convert arbitrary text into a URL-safe slug.

    Accents are stripped (NFKD normalisation), the text is lowered and
    every run of non-alphanumeric characters becomes a single hyphen.

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
    ascii_text = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    )
    return _NON_ALNUM.sub("-", ascii_text.lower()).strip("-")
