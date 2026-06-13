"""Request/response models for portfolio projects."""

from pydantic import BaseModel, Field

from src.schemas.common import LocalizedText, PublicationStatus


class ProjectBase(BaseModel):
    """Fields shared by project write and read models.

    Attributes
    ----------
    title, description, content_markdown : LocalizedText
        Bilingual content (Italian / English).
    technologies : list[str]
        Identifiers from the technologies table.
    category : str
        Free-form project category.
    images : list[str]
        S3 object keys of project images.
    github_url : str
        Repository URL.
    demo_url : str or None
        Optional live demo URL.
    status : PublicationStatus
        Publication lifecycle state.
    """

    title: LocalizedText
    description: LocalizedText
    content_markdown: LocalizedText
    technologies: list[str] = Field(default_factory=list)
    category: str = Field(min_length=1, max_length=64)
    images: list[str] = Field(default_factory=list)
    github_url: str = Field(min_length=1, max_length=512)
    demo_url: str | None = None
    status: PublicationStatus = PublicationStatus.DRAFT


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
