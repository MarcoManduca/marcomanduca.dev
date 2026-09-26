"""Integration tests for the media API."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration

_UPLOAD_PAYLOAD = {
    "prefix": "images/projects/",
    "filename": "screenshot.png",
    "content_type": "image/png",
}
_IMAGE_KEY = f"images/learning/{'a' * 32}-diagram.png"


async def test_presign_upload_returns_url_for_admin(
    admin_client: AsyncClient,
) -> None:
    # Act
    response = await admin_client.post("/api/v1/media/presign", json=_UPLOAD_PAYLOAD)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["key"].startswith("images/projects/")
    assert "test-media-bucket" in body["url"]


async def test_presign_upload_returns_401_without_token(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.post("/api/v1/media/presign", json=_UPLOAD_PAYLOAD)

    # Assert
    assert response.status_code == 401


async def test_presign_upload_returns_400_on_disallowed_content_type(
    admin_client: AsyncClient,
) -> None:
    # Arrange
    bad_payload = _UPLOAD_PAYLOAD | {"content_type": "text/html"}

    # Act
    response = await admin_client.post("/api/v1/media/presign", json=bad_payload)

    # Assert
    assert response.status_code == 400


async def test_presign_download_returns_url_for_valid_key(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get("/api/v1/media/url", params={"key": _IMAGE_KEY})

    # Assert
    assert response.status_code == 200
    assert response.json()["key"] == _IMAGE_KEY


async def test_presign_download_returns_400_on_foreign_key(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get(
        "/api/v1/media/url", params={"key": "private/secret.txt"}
    )

    # Assert
    assert response.status_code == 400


async def test_presign_download_returns_url_for_cv(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get("/api/v1/media/url", params={"key": "cv/cv.pdf"})

    # Assert
    assert response.status_code == 200


async def test_presign_upload_returns_422_when_declared_size_exceeds_limit(
    admin_client: AsyncClient,
) -> None:
    # Arrange
    too_big = _UPLOAD_PAYLOAD | {"content_length": 10 * 1024 * 1024 + 1}

    # Act
    response = await admin_client.post("/api/v1/media/presign", json=too_big)

    # Assert
    assert response.status_code == 422
