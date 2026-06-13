"""CV endpoints: structured JSON, PDF export, admin section updates."""

from typing import Any

from fastapi import APIRouter, Depends, Response

from src.schemas.common import Language
from src.schemas.cv import CvResponse, CvSectionId, CvSectionResponse, CvSectionUpdate
from src.services.cv_pdf_service import build_cv_pdf
from src.services.cv_service import CvService, get_cv_service
from src.utils.auth import require_admin

router = APIRouter(prefix="/cv", tags=["cv"])


@router.get("", response_model=CvResponse)
def get_cv(
    lang: Language = Language.EN,
    service: CvService = Depends(get_cv_service),
) -> dict[str, Any]:
    """Return the structured CV in the requested language.

    Parameters
    ----------
    lang : Language
        Requested language (``it`` or ``en``), default English.
    service : CvService
        Injected CV service.

    Returns
    -------
    dict[str, Any]
        ``{"lang": ..., "sections": {...}}``.
    """
    return {"lang": lang, "sections": service.get_cv(lang)}


@router.get("/pdf")
def get_cv_pdf(
    lang: Language = Language.EN,
    service: CvService = Depends(get_cv_service),
) -> Response:
    """Export the CV as a generated PDF.

    Parameters
    ----------
    lang : Language
        Requested language (``it`` or ``en``), default English.
    service : CvService
        Injected CV service.

    Returns
    -------
    fastapi.Response
        ``application/pdf`` response with an attachment filename.
    """
    pdf_bytes = build_cv_pdf(service.get_cv(lang), lang)
    filename = f"marco-manduca-cv-{lang.value}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.put(
    "/{section_id}",
    response_model=CvSectionResponse,
    dependencies=[Depends(require_admin)],
)
def update_cv_section(
    section_id: CvSectionId,
    payload: CvSectionUpdate,
    service: CvService = Depends(get_cv_service),
) -> dict[str, Any]:
    """Create or replace a CV section (admin only).

    Parameters
    ----------
    section_id : CvSectionId
        Section to write.
    payload : CvSectionUpdate
        New bilingual section content.
    service : CvService
        Injected CV service.

    Returns
    -------
    dict[str, Any]
        The stored section item.
    """
    return service.upsert_section(section_id, payload)
