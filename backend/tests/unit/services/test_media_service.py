"""Unit tests for MediaService presigned URL generation."""

import re
from urllib.parse import parse_qs, urlparse

import pytest
from pydantic import ValidationError

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
        content_length=2048,
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
        content_length=2048,
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert
    assert response.key == "cv/cv.pdf"
    assert response.expires_in == 900


def test_create_upload_url_rejects_non_image_under_image_prefix(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.LEARNING_IMAGES,
        filename="malware.exe",
        content_type="application/octet-stream",
        content_length=2048,
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
        content_length=2048,
    )

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_upload_url(payload)


def test_create_download_url_returns_signed_url_for_valid_key(
    service: MediaService,
) -> None:
    # Arrange
    key = f"images/projects/{'0' * 32}-photo.png"

    # Act
    response = service.create_download_url(key)

    # Assert
    assert response.key == key
    assert "test-media-bucket" in response.url


def test_create_download_url_rejects_key_outside_media_prefixes(
    service: MediaService,
) -> None:
    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_download_url("secrets/credentials.txt")


@pytest.mark.parametrize(
    "content_type, extension",
    [
        ("image/png", ".png"),
        ("image/jpeg", ".jpg"),
        ("image/webp", ".webp"),
        ("image/gif", ".gif"),
    ],
)
def test_create_upload_url_derives_extension_from_content_type(
    service: MediaService, content_type: str, extension: str
) -> None:
    # Arrange: the client filename claims a different, dangerous extension.
    payload = PresignUploadRequest(
        prefix=MediaPrefix.PROJECT_IMAGES,
        filename="evil.html",
        content_type=content_type,
        content_length=2048,
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert
    assert response.key.endswith(f"-evil{extension}")


@pytest.mark.parametrize(
    "content_type",
    ["image/svg+xml", "image/x-icon", "text/html", "image/png; charset=utf-8"],
)
def test_create_upload_url_rejects_types_outside_the_allowlist(
    service: MediaService, content_type: str
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.PROJECT_IMAGES,
        filename="image",
        content_type=content_type,
        content_length=2048,
    )

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_upload_url(payload)


def test_create_upload_url_sanitizes_the_filename_stem(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.LEARNING_IMAGES,
        filename="../../Ünïcode $name" + "x" * 200 + ".PNG",
        content_type="image/png",
        content_length=2048,
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert
    assert re.fullmatch(
        r"images/learning/[0-9a-f]{32}-[a-z0-9-]{1,64}\.png", response.key
    )


def test_create_upload_url_signs_the_declared_content_length(
    service: MediaService,
) -> None:
    # Arrange
    payload = PresignUploadRequest(
        prefix=MediaPrefix.CV,
        filename="cv.pdf",
        content_type="application/pdf",
        content_length=2048,
    )

    # Act
    response = service.create_upload_url(payload)

    # Assert: S3 rejects an upload whose size or type differs from these.
    signed = parse_qs(urlparse(response.url).query)["X-Amz-SignedHeaders"][0]
    assert signed.split(";") == ["content-length", "content-type", "host"]
    assert "X-Amz-Algorithm=AWS4-HMAC-SHA256" in response.url


def test_create_upload_url_requires_the_content_length() -> None:
    # Act / Assert: an unsigned size would let the PUT accept any body.
    with pytest.raises(ValidationError):
        PresignUploadRequest(
            prefix=MediaPrefix.CV,
            filename="cv.pdf",
            content_type="application/pdf",
        )


def test_create_upload_url_rejects_content_length_above_limit() -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        PresignUploadRequest(
            prefix=MediaPrefix.CV,
            filename="cv.pdf",
            content_type="application/pdf",
            content_length=10 * 1024 * 1024 + 1,
        )


@pytest.mark.parametrize(
    "key",
    [
        "cv/other.pdf",
        "images/projects/abc-photo.png",
        f"images/projects/{'0' * 32}-photo.svg",
        f"images/projects/{'0' * 32}-../../secret.png",
        f"images/other/{'0' * 32}-photo.png",
    ],
)
def test_create_download_url_rejects_keys_not_matching_generated_format(
    service: MediaService, key: str
) -> None:
    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_download_url(key)
