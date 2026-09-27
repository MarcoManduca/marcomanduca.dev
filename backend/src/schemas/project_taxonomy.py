"""Fixed vocabularies that classify a project.

Each one answers a single question and has a single job in the UI:

- ``ProjectArea``: in which fields? The first area colours the card.
- ``ProjectContext``: where did it start?
- ``LinkKind``: what a project link points to.
- ``LabKind``: which interactive demo a project page embeds.
"""

from enum import StrEnum


class ProjectArea(StrEnum):
    """Field of a project, grouped on the site in three colour families."""

    FRONTEND = "frontend"
    BACKEND = "backend"
    CLOUD = "cloud"
    DATA = "data"
    ML = "ml"
    DL = "dl"
    AI = "ai"


class ProjectContext(StrEnum):
    """Where the project was born."""

    ACADEMIC = "academic"
    PERSONAL = "personal"
    WORK = "work"


class LinkKind(StrEnum):
    """Destination of a project link."""

    REPO = "repo"
    PAPER = "paper"
    DOCS = "docs"
    LIVE = "live"
    VIDEO = "video"
    DATASET = "dataset"


class LabKind(StrEnum):
    """Interactive demo shown in a project's lab section."""

    IMAGE_COMPARE = "image-compare"
