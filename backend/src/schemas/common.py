"""Shared schema primitives used across domains."""

from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, Field

# Length caps keep every item far below DynamoDB's 400 KB limit: a project or
# article version holds both languages, so two markdown bodies of 60k chars
# (~120 KB for mostly-ASCII text) plus metadata still leave ample headroom.
TITLE_MAX_LENGTH = 200
SUMMARY_MAX_LENGTH = 1000
MARKDOWN_MAX_LENGTH = 60_000
URL_MAX_LENGTH = 512

Tag = Annotated[str, Field(min_length=1, max_length=40)]
TechnologyId = Annotated[str, Field(min_length=1, max_length=100)]
MediaRef = Annotated[str, Field(min_length=1, max_length=1024)]


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
