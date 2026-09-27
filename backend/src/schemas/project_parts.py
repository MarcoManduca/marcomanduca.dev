"""Building blocks of a project: key numbers, media, links and its brief."""

from pydantic import BaseModel, Field, field_validator

from src.schemas.common import (
    URL_MAX_LENGTH,
    LocalizedLabel,
    LocalizedLine,
    MediaRef,
)
from src.schemas.project_taxonomy import LinkKind
from src.schemas.urls import require_http_url


class Metric(BaseModel):
    """A key number shown on the card and the project page.

    Attributes
    ----------
    value : str
        The figure as displayed (``"16"``, ``"2015–18"``, ``"0.91"``).
    label : LocalizedLabel
        What the figure counts.
    """

    value: str = Field(min_length=1, max_length=12)
    label: LocalizedLabel


class MediaItem(BaseModel):
    """An image with the text that stands in for it.

    Attributes
    ----------
    src : str
        Image URL or media-bucket key.
    alt : LocalizedLine
        Alternative text for assistive technologies.
    caption : LocalizedLine or None
        Optional visible caption.
    """

    src: MediaRef
    alt: LocalizedLine
    caption: LocalizedLine | None = None


class ProjectLink(BaseModel):
    """An external resource of the project.

    Attributes
    ----------
    kind : LinkKind
        What the link points to (repository, paper, live site...).
    url : str
        ``http(s)`` URL.
    """

    kind: LinkKind
    url: str = Field(min_length=1, max_length=URL_MAX_LENGTH)

    _validate_url = field_validator("url")(require_http_url)


class QuestBrief(BaseModel):
    """The project told as a quest, echoing the Home quest log.

    Attributes
    ----------
    objective : LocalizedLine
        What the project set out to do.
    boss : LocalizedLine
        The hardest problem it had to beat.
    rewards : LocalizedLine
        What it delivered.
    """

    objective: LocalizedLine
    boss: LocalizedLine
    rewards: LocalizedLine
