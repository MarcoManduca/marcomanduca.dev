"""Request/response models for learning articles."""

from enum import StrEnum

from pydantic import BaseModel, Field

from src.schemas.common import LocalizedText, PublicationStatus


class LearningCategory(StrEnum):
    """Knowledge-base top-level categories."""

    CS = "CS"
    DATA = "Data"
    SWE = "SWE"
    CLOUD = "Cloud"
    MATH = "Math"


class ArticleBase(BaseModel):
    """Fields shared by article write and read models.

    Attributes
    ----------
    title, content_markdown : LocalizedText
        Bilingual markdown content.
    category : LearningCategory
        Knowledge-base category.
    tags : list[str]
        Free-form tags.
    status : PublicationStatus
        Publication lifecycle state.
    """

    title: LocalizedText
    content_markdown: LocalizedText
    category: LearningCategory
    tags: list[str] = Field(default_factory=list)
    status: PublicationStatus = PublicationStatus.DRAFT


class ArticleCreate(ArticleBase):
    """Payload to create an article (stored as version 1)."""


class ArticleUpdate(ArticleBase):
    """Payload to update an article (stored as a new version)."""


class ArticleResponse(ArticleBase):
    """Article version as returned by the API.

    Attributes
    ----------
    slug : str
        Partition key, generated from the English title.
    version : int
        Monotonically increasing sort key.
    created_at, updated_at : str
        ISO-8601 UTC timestamps.
    """

    slug: str
    version: int
    created_at: str
    updated_at: str


class ArticleVersionInfo(BaseModel):
    """Compact descriptor of a stored article version.

    Attributes
    ----------
    version : int
        Version number.
    updated_at : str
        ISO-8601 UTC timestamp of the version write.
    status : PublicationStatus
        Status recorded on that version.
    """

    version: int
    updated_at: str
    status: PublicationStatus


class RollbackRequest(BaseModel):
    """Payload selecting the version to restore.

    Attributes
    ----------
    version : int
        Existing version number to copy as the new latest version.
    """

    version: int = Field(ge=1)
