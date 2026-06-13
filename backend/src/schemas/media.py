"""Request/response models for media presigned URLs."""

from enum import StrEnum

from pydantic import BaseModel, Field


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
        Original file name; it is sanitised before use.
    content_type : str
        MIME type the client will send on upload.
    """

    prefix: MediaPrefix
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=128)


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
