"""Request/response models for portfolio projects.

The site lists only finished projects, so a project has no progress, period
or team: it is classified by area and context (``project_taxonomy``),
told as a quest (``QuestBrief``) and may embed an optional lab
(``project_lab``). Lists return the light ``ProjectCard``; the project page
reads the full ``ProjectResponse``.
"""

from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from src.schemas.common import (
    LocalizedLabel,
    LocalizedMarkdown,
    LocalizedSummary,
    LocalizedTitle,
    PublicationStatus,
    TechnologyId,
)
from src.schemas.project_lab import ProjectLab
from src.schemas.project_parts import MediaItem, Metric, ProjectLink, QuestBrief
from src.schemas.project_taxonomy import ProjectArea, ProjectContext

#: Anchor of a CV entry on the About page, e.g. ``study-2025-09``.
QuestKey = Annotated[str, Field(pattern=r"^(work|study)-\d{4}-(0[1-9]|1[0-2])$")]


def _require_unique_areas(areas: list[ProjectArea]) -> list[ProjectArea]:
    """Reject a project listed twice under the same area.

    Parameters
    ----------
    areas : list[ProjectArea]
        Candidate areas, the first one being the main area.

    Returns
    -------
    list[ProjectArea]
        The unchanged areas.

    Raises
    ------
    ValueError
        When an area repeats.
    """
    if len(areas) != len(set(areas)):
        raise ValueError("Areas must be unique.")
    return areas


class ProjectCardFields(BaseModel):
    """Everything a project card shows (Home deck, Projects grid).

    Attributes
    ----------
    title : LocalizedTitle
        Bilingual title.
    description : LocalizedSummary
        Short text of the card.
    areas : list[ProjectArea]
        One to three fields, all shown; the first colours the card.
    context : ProjectContext
        Where it was born.
    cover : MediaItem or None
        Card image; without one the card draws the art of its area.
    metrics : list[Metric]
        Up to four key numbers; cards show the first three.
    technologies : list[str]
        Technology ids in display order; cards show the first five.
    """

    title: LocalizedTitle
    description: LocalizedSummary
    areas: list[ProjectArea] = Field(min_length=1, max_length=3)
    context: ProjectContext
    cover: MediaItem | None = None
    metrics: list[Metric] = Field(default_factory=list, max_length=4)
    technologies: list[TechnologyId] = Field(default_factory=list, max_length=30)

    _unique_areas = field_validator("areas")(_require_unique_areas)


class ProjectBase(ProjectCardFields):
    """Fields shared by project write and read models.

    Attributes
    ----------
    brief : QuestBrief
        Objective, final boss and rewards.
    content_markdown : LocalizedMarkdown
        Bilingual markdown body.
    topics : list[LocalizedLabel]
        Up to five subject tags.
    media : list[MediaItem]
        Gallery images (at most 20).
    links : list[ProjectLink]
        Repository, paper, live site and other resources (at most 10).
    license : str
        Licence of the work, e.g. ``CC BY-NC-SA 4.0``; every project states
        it on the opening of its page.
    quest : str or None
        CV entry the project was born in, as its About page anchor.
    lab : ProjectLab or None
        Optional interactive demo; the page shows it only when present.
    status : PublicationStatus
        Publication lifecycle state.
    """

    brief: QuestBrief
    content_markdown: LocalizedMarkdown
    topics: list[LocalizedLabel] = Field(default_factory=list, max_length=5)
    media: list[MediaItem] = Field(default_factory=list, max_length=20)
    links: list[ProjectLink] = Field(default_factory=list, max_length=10)
    license: str = Field(min_length=1, max_length=64)
    quest: QuestKey | None = None
    lab: ProjectLab | None = None
    status: PublicationStatus = PublicationStatus.DRAFT


class ProjectCreate(ProjectBase):
    """Payload to create a project; the slug derives from the title."""


class ProjectUpdate(ProjectBase):
    """Payload to fully replace an existing project."""


class ProjectResponse(ProjectBase):
    """Project as returned by the project page endpoint.

    Attributes
    ----------
    slug : str
        Primary key, generated from the English title.
    created_at, updated_at : str
        ISO-8601 UTC timestamps.
    """

    slug: str
    created_at: str
    updated_at: str


class ProjectCard(ProjectCardFields):
    """Light project summary returned by the list endpoint.

    Attributes
    ----------
    slug : str
        Primary key.
    repo_url : str or None
        First repository link, for the card's code button.
    status : PublicationStatus
        Publication state (admins also list drafts).
    created_at : str
        ISO-8601 UTC creation time; it orders the deck.
    """

    slug: str
    repo_url: str | None = None
    status: PublicationStatus
    created_at: str
