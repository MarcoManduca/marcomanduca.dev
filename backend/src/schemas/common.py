"""Shared schema primitives used across domains."""

from enum import StrEnum

from pydantic import BaseModel


class Language(StrEnum):
    """Supported content languages."""

    IT = "it"
    EN = "en"


class PublicationStatus(StrEnum):
    """Lifecycle status of public content."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LocalizedText(BaseModel):
    """A text value provided in both Italian and English.

    Attributes
    ----------
    it : str
        Italian translation.
    en : str
        English translation.
    """

    it: str
    en: str
