"""Media endpoints issuing S3 presigned URLs."""

from fastapi import APIRouter, Depends, Query

from src.schemas.media import (
    PresignDownloadResponse,
    PresignUploadRequest,
    PresignUploadResponse,
)
from src.services.media_service import MediaService, get_media_service
from src.utils.auth import require_admin

router = APIRouter(prefix="/media", tags=["media"])


@router.post(
    "/presign",
    response_model=PresignUploadResponse,
    dependencies=[Depends(require_admin)],
)
def presign_upload(
    payload: PresignUploadRequest,
    service: MediaService = Depends(get_media_service),
) -> PresignUploadResponse:
    """Issue a presigned PUT URL for a media upload (admin only).

    Parameters
    ----------
    payload : PresignUploadRequest
        Destination prefix, filename and MIME type.
    service : MediaService
        Injected media service.

    Returns
    -------
    PresignUploadResponse
        Presigned URL, final object key and expiry.
    """
    return service.create_upload_url(payload)


@router.get("/url", response_model=PresignDownloadResponse)
def presign_download(
    key: str = Query(min_length=1, max_length=512),
    service: MediaService = Depends(get_media_service),
) -> PresignDownloadResponse:
    """Issue a presigned GET URL for a stored media object.

    Parameters
    ----------
    key : str
        S3 object key under an allowed media prefix.
    service : MediaService
        Injected media service.

    Returns
    -------
    PresignDownloadResponse
        Presigned URL, object key and expiry.
    """
    return service.create_download_url(key)
