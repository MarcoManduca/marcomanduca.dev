"""Request/response models for media presigned URLs."""

from enum import StrEnum

from pydantic import BaseModel, Field

# Upper bound for a single upload (images and the CV PDF).
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


class MediaPrefix(StrEnum):
    """Allowed S3 key prefixes for uploads."""

    PROJECT_IMAGES = "images/projects/"
    LEARNING_IMAGES = "images/learning/"
    CV = "cv/"


class PresignUploadRequest(BaseModel):
    """Request for a presigned PUT URL.

    Attributes
    ----------
    prefix : MediaPrefix
        Destination prefix inside the media bucket.
    filename : str
        Original file name; only a sanitised stem is kept.
    content_type : str
        MIME type the client will send on upload (allowlisted per prefix).
    content_length : int
        Exact size in bytes (at most 10 MB). It is signed into the URL, so
        S3 rejects a body of any other size: without it the presigned PUT
        would accept an upload of any size.
    """

    prefix: MediaPrefix
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=128)
    content_length: int = Field(ge=1, le=MAX_UPLOAD_BYTES)


class PresignUploadResponse(BaseModel):
    """Presigned PUT URL and the key it targets.

    Attributes
    ----------
    url : str
        Presigned PUT URL.
    key : str
        Final S3 object key.
    expires_in : int
        URL validity in seconds.
    """

    url: str
    key: str
    expires_in: int


class PresignDownloadResponse(BaseModel):
    """Presigned GET URL for an existing object.

    Attributes
    ----------
    url : str
        Presigned GET URL.
    key : str
        S3 object key the URL points to.
    expires_in : int
        URL validity in seconds.
    """

    url: str
    key: str
    expires_in: int
