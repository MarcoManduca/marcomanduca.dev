"""Unit tests for MediaService presigned URL generation."""

import pytest

from src.schemas.media import MediaPrefix, PresignUploadRequest
from src.services.errors import InvalidInputError
from src.services.media_service import MediaService


@pytest.fixture
def service(aws_backend: None) -> MediaService:
    """Media service bound to the moto S3 backend."""
    return MediaService()


def test_create_upload_url_targets_the_requested_prefix(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.PROJECT_IMAGES,
        filename="Screenshot Finale.PNG",
        content_type="image/png",
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert
    assert response.key.startswith("images/projects/")
    assert response.key.endswith("-screenshot-finale.png")
    assert "test-media-bucket" in response.url


def test_create_upload_url_accepts_pdf_under_cv_prefix(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.CV,
        filename="cv.pdf",
        content_type="application/pdf",
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert
    assert response.key.startswith("cv/")
    assert response.expires_in == 900


def test_create_upload_url_rejects_non_image_under_image_prefix(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.LEARNING_IMAGES,
        filename="malware.exe",
        content_type="application/octet-stream",
    )

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_upload_url(payload)


def test_create_upload_url_rejects_non_pdf_under_cv_prefix(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.CV,
        filename="cv.docx",
        content_type="application/msword",
    )

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_upload_url(payload)


def test_create_download_url_returns_signed_url_for_valid_key(
    service: MediaService,
) -> None:
    # Act
    response = service.create_download_url("images/projects/abc-photo.png")

    # Assert
    assert response.key == "images/projects/abc-photo.png"
    assert "test-media-bucket" in response.url


def test_create_download_url_rejects_key_outside_media_prefixes(
    service: MediaService,
) -> None:
    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_download_url("secrets/credentials.txt")
