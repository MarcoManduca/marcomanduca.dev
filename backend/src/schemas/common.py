"""Shared schema primitives used across domains."""

from enum import StrEnum
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

from src.schemas.urls import require_media_ref

# Length caps keep every item far below DynamoDB's 400 KB limit: a project or
# article version holds both languages, so two markdown bodies of 60k chars
# (~120 KB for mostly-ASCII text) plus metadata still leave ample headroom.
TITLE_MAX_LENGTH = 200
SUMMARY_MAX_LENGTH = 1000
LABEL_MAX_LENGTH = 60
LINE_MAX_LENGTH = 280
MARKDOWN_MAX_LENGTH = 60_000
URL_MAX_LENGTH = 512

Tag = Annotated[str, Field(min_length=1, max_length=40)]
TechnologyId = Annotated[str, Field(min_length=1, max_length=100)]
# An image source: an http(s) URL or a site path (see ``require_media_ref``).
MediaRef = Annotated[
    str, Field(min_length=1, max_length=1024), AfterValidator(require_media_ref)
]


class Language(StrEnum):
    """Supported content languages."""

    IT = "it"
    EN = "en"


class PublicationStatus(StrEnum):
    """Lifecycle status of public content."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LocalizedTitle(BaseModel):
    """A short title in both Italian and English (1-200 chars each).

    Attributes
    ----------
    it : str
        Italian translation.
    en : str
        English translation.
    """

    it: str = Field(min_length=1, max_length=TITLE_MAX_LENGTH)
    en: str = Field(min_length=1, max_length=TITLE_MAX_LENGTH)


class LocalizedSummary(BaseModel):
    """A short description in both languages (1-1000 chars each).

    Attributes
    ----------
    it : str
        Italian translation.
    en : str
        English translation.
    """

    it: str = Field(min_length=1, max_length=SUMMARY_MAX_LENGTH)
    en: str = Field(min_length=1, max_length=SUMMARY_MAX_LENGTH)


class LocalizedLabel(BaseModel):
    """A few words in both languages (1-60 chars each), e.g. a tag or label.

    Attributes
    ----------
    it : str
        Italian translation.
    en : str
        English translation.
    """

    it: str = Field(min_length=1, max_length=LABEL_MAX_LENGTH)
    en: str = Field(min_length=1, max_length=LABEL_MAX_LENGTH)


class LocalizedLine(BaseModel):
    """One sentence in both languages (1-280 chars each), e.g. an alt text.

    Attributes
    ----------
    it : str
        Italian translation.
    en : str
        English translation.
    """

    it: str = Field(min_length=1, max_length=LINE_MAX_LENGTH)
    en: str = Field(min_length=1, max_length=LINE_MAX_LENGTH)


class LocalizedMarkdown(BaseModel):
    """A markdown body in both languages (1-60,000 chars each).

    Attributes
    ----------
    it : str
        Italian markdown.
    en : str
        English markdown.
    """

    it: str = Field(min_length=1, max_length=MARKDOWN_MAX_LENGTH)
    en: str = Field(min_length=1, max_length=MARKDOWN_MAX_LENGTH)
