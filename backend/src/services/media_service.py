"""S3 presigned URL generation for media uploads and downloads."""

from pathlib import PurePosixPath
from uuid import uuid4

import boto3

from src.config import get_settings
from src.schemas.media import (
    MediaPrefix,
    PresignDownloadResponse,
    PresignUploadRequest,
    PresignUploadResponse,
)
from src.services.errors import InvalidInputError
from src.utils.slugify import slugify

_IMAGE_PREFIXES = (MediaPrefix.PROJECT_IMAGES, MediaPrefix.LEARNING_IMAGES)
_ALLOWED_KEY_PREFIXES = tuple(prefix.value for prefix in MediaPrefix)


class MediaService:
    """Issue short-lived presigned URLs for the media bucket."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = boto3.client("s3", region_name=settings.aws_region)
        self._bucket = settings.media_bucket_name
        self._expiration = settings.presign_expiration_seconds

    def create_upload_url(self, payload: PresignUploadRequest) -> PresignUploadResponse:
        """Create a presigned PUT URL under an allowed prefix.

        Parameters
        ----------
        payload : PresignUploadRequest
            Destination prefix, original filename and MIME type.

        Returns
        -------
        PresignUploadResponse
            Presigned URL, final object key and expiry.

        Raises
        ------
        InvalidInputError
            When the MIME type is not allowed for the prefix.
        """
        _validate_content_type(payload.prefix, payload.content_type)
        key = _object_key(payload.prefix, payload.filename)
        url = self._client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self._bucket,
                "Key": key,
                "ContentType": payload.content_type,
            },
            ExpiresIn=self._expiration,
        )
        return PresignUploadResponse(url=url, key=key, expires_in=self._expiration)

    def create_download_url(self, key: str) -> PresignDownloadResponse:
        """Create a presigned GET URL for an object in the bucket.

        Parameters
        ----------
        key : str
            S3 object key; must live under an allowed media prefix.

        Returns
        -------
        PresignDownloadResponse
            Presigned URL, object key and expiry.

        Raises
        ------
        InvalidInputError
            When the key does not start with an allowed prefix.
        """
        if not key.startswith(_ALLOWED_KEY_PREFIXES):
            raise InvalidInputError(f"Key '{key}' is outside the media prefixes.")
        url = self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=self._expiration,
        )
        return PresignDownloadResponse(url=url, key=key, expires_in=self._expiration)


def _object_key(prefix: MediaPrefix, filename: str) -> str:
    """Build the S3 object key for an upload.

    The CV is a singleton document stored at a fixed key (``cv/cv.pdf``) so the
    public download button can always find it and re-uploads replace it. Images
    get a unique key to avoid collisions.

    Parameters
    ----------
    prefix : MediaPrefix
        Destination prefix.
    filename : str
        Original filename (used only for image keys).

    Returns
    -------
    str
        The S3 object key.
    """
    if prefix is MediaPrefix.CV:
        return f"{prefix.value}cv.pdf"
    return f"{prefix.value}{uuid4().hex}-{_safe_name(filename)}"


def _validate_content_type(prefix: MediaPrefix, content_type: str) -> None:
    """Reject MIME types that do not belong under the given prefix."""
    if prefix in _IMAGE_PREFIXES and not content_type.startswith("image/"):
        raise InvalidInputError(f"Content type '{content_type}' is not an image type.")
    if prefix is MediaPrefix.CV and content_type != "application/pdf":
        raise InvalidInputError("CV uploads must be 'application/pdf'.")


def _safe_name(filename: str) -> str:
    """Sanitise a filename into ``<slug><lowercase-extension>``."""
    path = PurePosixPath(filename)
    stem = slugify(path.stem) or "file"
    return f"{stem}{path.suffix.lower()}"


def get_media_service() -> MediaService:
    """Build a request-scoped :class:`MediaService`.

    Returns
    -------
    MediaService
        Service bound to a fresh S3 client.
    """
    return MediaService()
