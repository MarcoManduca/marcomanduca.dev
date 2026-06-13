"""Request/response models for the dynamic CV."""

from enum import StrEnum
from typing import Any

from pydantic import BaseModel

from src.schemas.common import Language


class CvSectionId(StrEnum):
    """Fixed set of CV sections."""

    SUMMARY = "summary"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILLS = "skills"


class LocalizedContent(BaseModel):
    """Arbitrary structured JSON content in both languages.

    Attributes
    ----------
    it : Any
        Italian content (string, list or object).
    en : Any
        English content (string, list or object).
    """

    it: Any
    en: Any


class CvSectionUpdate(BaseModel):
    """Payload to replace a CV section.

    Attributes
    ----------
    content : LocalizedContent
        New bilingual content of the section.
    """

    content: LocalizedContent


class CvSectionResponse(BaseModel):
    """A stored CV section with bilingual content.

    Attributes
    ----------
    section : CvSectionId
        Section identifier.
    content : LocalizedContent
        Bilingual section content.
    """

    section: CvSectionId
    content: LocalizedContent


class CvResponse(BaseModel):
    """The CV localized to a single language.

    Attributes
    ----------
    lang : Language
        Requested language.
    sections : dict[str, Any]
        Mapping of section id to localized content.
    """

    lang: Language
    sections: dict[str, Any]
