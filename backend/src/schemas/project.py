"""Request/response models for portfolio projects."""

from pydantic import BaseModel, Field, field_validator

from src.schemas.common import (
    URL_MAX_LENGTH,
    LocalizedMarkdown,
    LocalizedSummary,
    LocalizedTitle,
    MediaRef,
    PublicationStatus,
    TechnologyId,
)

_ALLOWED_URL_SCHEMES = ("http://", "https://")


def _require_http_url(value: str | None) -> str | None:
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


class ProjectBase(BaseModel):
    """Fields shared by project write and read models.

    Attributes
    ----------
    title : LocalizedTitle
        Bilingual title (Italian / English).
    description : LocalizedSummary
        Bilingual short description.
    content_markdown : LocalizedMarkdown
        Bilingual markdown body.
    technologies : list[str]
        Identifiers from the technologies table (at most 30).
    category : str
        Free-form project category.
    images : list[str]
        Image URLs or S3 object keys (at most 20).
    github_url : str
        Repository URL.
    demo_url : str or None
        Optional live demo URL.
    status : PublicationStatus
        Publication lifecycle state.
    """

    title: LocalizedTitle
    description: LocalizedSummary
    content_markdown: LocalizedMarkdown
    technologies: list[TechnologyId] = Field(default_factory=list, max_length=30)
    category: str = Field(min_length=1, max_length=64)
    images: list[MediaRef] = Field(default_factory=list, max_length=20)
    github_url: str = Field(min_length=1, max_length=URL_MAX_LENGTH)
    demo_url: str | None = Field(default=None, max_length=URL_MAX_LENGTH)
    status: PublicationStatus = PublicationStatus.DRAFT

    _validate_urls = field_validator("github_url", "demo_url")(_require_http_url)


class ProjectCreate(ProjectBase):
    """Payload to create a project; the slug derives from the title."""


class ProjectUpdate(ProjectBase):
    """Payload to fully replace an existing project."""


class ProjectResponse(ProjectBase):
    """Project as returned by the API.

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
