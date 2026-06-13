"""Integration tests for the CV API (structured JSON and PDF)."""

from typing import Any

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_update_cv_section_returns_stored_content(
    admin_client: AsyncClient, sample_cv_sections: dict[str, Any]
) -> None:
    # Act
    response = await admin_client.put(
        "/api/v1/cv/summary",
        json={"content": sample_cv_sections["summary"]},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["section"] == "summary"


async def test_update_cv_section_returns_401_without_token(
    public_client: AsyncClient, sample_cv_sections: dict[str, Any]
) -> None:
    # Act
    response = await public_client.put(
        "/api/v1/cv/summary",
        json={"content": sample_cv_sections["summary"]},
    )

    # Assert
    assert response.status_code == 401


async def test_get_cv_returns_sections_in_requested_language(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    sample_cv_sections: dict[str, Any],
) -> None:
    # Arrange
    await admin_client.put(
        "/api/v1/cv/summary", json={"content": sample_cv_sections["summary"]}
    )

    # Act
    response = await public_client.get("/api/v1/cv", params={"lang": "it"})

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["lang"] == "it"
    assert body["sections"]["summary"] == sample_cv_sections["summary"]["it"]


async def test_get_cv_pdf_returns_valid_pdf_bytes(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    sample_cv_sections: dict[str, Any],
) -> None:
    # Arrange
    await admin_client.put(
        "/api/v1/cv/experience",
        json={"content": sample_cv_sections["experience"]},
    )

    # Act
    response = await public_client.get("/api/v1/cv/pdf", params={"lang": "en"})

    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
