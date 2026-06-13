"""Unit tests for the CV PDF renderer."""

from typing import Any

from src.schemas.common import Language
from src.services.cv_pdf_service import build_cv_pdf


def test_build_cv_pdf_returns_valid_pdf_bytes(
    sample_cv_sections: dict[str, Any],
) -> None:
    # Arrange
    localized = {
        section: content["en"] for section, content in sample_cv_sections.items()
    }

    # Act
    pdf_bytes = build_cv_pdf(localized, Language.EN)

    # Assert
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 100


def test_build_cv_pdf_handles_empty_sections() -> None:
    # Act
    pdf_bytes = build_cv_pdf({}, Language.IT)

    # Assert
    assert pdf_bytes.startswith(b"%PDF")


def test_build_cv_pdf_handles_mixed_content_types() -> None:
    # Arrange
    sections = {
        "summary": "Plain text section",
        "experience": [{"role": "Engineer", "years": 3.5}],
        "skills": ["Python", 42, None],
    }

    # Act
    pdf_bytes = build_cv_pdf(sections, Language.EN)

    # Assert
    assert pdf_bytes.startswith(b"%PDF")
