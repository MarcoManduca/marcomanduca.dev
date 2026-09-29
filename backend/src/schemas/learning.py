"""Request/response models for learning articles."""

from enum import StrEnum

from pydantic import BaseModel, Field

from src.schemas.common import (
    LocalizedMarkdown,
    LocalizedTitle,
    PublicationStatus,
    Tag,
)
from src.utils.excerpt import DEFAULT_LENGTH

# The excerpt text plus its trailing ellipsis.
EXCERPT_MAX_LENGTH = DEFAULT_LENGTH + 1


class LearningCategory(StrEnum):
    """Knowledge-base top-level categories."""

    CS = "CS"
    DATA = "Data"
    SWE = "SWE"
    CLOUD = "Cloud"
    MATH = "Math"


class ArticleFields(BaseModel):
    """Article fields shared by every model, the body excluded.

    Attributes
    ----------
    title : LocalizedTitle
        Bilingual title.
    category : LearningCategory
        Knowledge-base category.
    tags : list[str]
        Free-form tags (at most 20, 1-40 chars each).
    status : PublicationStatus
        Publication lifecycle state.
    """

    title: LocalizedTitle
    category: LearningCategory
    tags: list[Tag] = Field(default_factory=list, max_length=20)
    status: PublicationStatus = PublicationStatus.DRAFT


class ArticleBase(ArticleFields):
    """Fields shared by article write and full read models.

    Attributes
    ----------
    content_markdown : LocalizedMarkdown
        Bilingual markdown body.
    """

    content_markdown: LocalizedMarkdown


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


class LocalizedExcerpt(BaseModel):
    """Plain-text preview of the body in both languages.

    Attributes
    ----------
    it, en : str
        Excerpt of each language (see ``src.utils.excerpt``); empty when
        the body has no text left once markdown is stripped.
    """

    it: str = Field(max_length=EXCERPT_MAX_LENGTH)
    en: str = Field(max_length=EXCERPT_MAX_LENGTH)


class ArticleSummary(ArticleFields):
    """Latest version of an article as listed: an excerpt, not the body.

    Attributes
    ----------
    slug : str
        Partition key, generated from the English title.
    version : int
        Latest version number.
    excerpt : LocalizedExcerpt
        Plain-text preview of the body.
    created_at, updated_at : str
        ISO-8601 UTC timestamps.
    """

    slug: str
    version: int
    excerpt: LocalizedExcerpt
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
