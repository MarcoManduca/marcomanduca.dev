"""Unit tests for CvService."""

from typing import Any

import pytest

from src.models.cv_table import CvTable
from src.schemas.common import Language
from src.schemas.cv import CvSectionId, CvSectionUpdate, LocalizedContent
from src.services.cv_service import CvService


@pytest.fixture
def service(aws_backend: None) -> CvService:
    """CV service bound to the moto-backed table."""
    return CvService(CvTable())


def test_upsert_section_stores_bilingual_content(
    service: CvService, sample_cv_sections: dict[str, Any]
) -> None:
    # Arrange
    payload = CvSectionUpdate(content=LocalizedContent(**sample_cv_sections["summary"]))

    # Act
    item = service.upsert_section(CvSectionId.SUMMARY, payload)

    # Assert
    assert item["section"] == "summary"
    assert item["content"]["en"] == sample_cv_sections["summary"]["en"]


def test_get_cv_returns_localized_sections(
    service: CvService, sample_cv_sections: dict[str, Any]
) -> None:
    # Arrange
    service.upsert_section(
        CvSectionId.SUMMARY,
        CvSectionUpdate(content=LocalizedContent(**sample_cv_sections["summary"])),
    )
    service.upsert_section(
        CvSectionId.SKILLS,
        CvSectionUpdate(content=LocalizedContent(**sample_cv_sections["skills"])),
    )

    # Act
    cv = service.get_cv(Language.IT)

    # Assert
    assert cv["summary"] == sample_cv_sections["summary"]["it"]
    assert cv["skills"] == sample_cv_sections["skills"]["it"]


def test_get_cv_returns_empty_mapping_without_sections(
    service: CvService,
) -> None:
    # Act
    cv = service.get_cv(Language.EN)

    # Assert
    assert cv == {}


def test_get_sections_returns_both_languages(
    service: CvService, sample_cv_sections: dict[str, Any]
) -> None:
    # Arrange
    service.upsert_section(
        CvSectionId.EXPERIENCE,
        CvSectionUpdate(content=LocalizedContent(**sample_cv_sections["experience"])),
    )

    # Act
    sections = service.get_sections()

    # Assert
    assert sections["experience"]["it"] == sample_cv_sections["experience"]["it"]
    assert sections["experience"]["en"] == sample_cv_sections["experience"]["en"]
