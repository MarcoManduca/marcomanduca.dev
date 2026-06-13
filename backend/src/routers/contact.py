"""Contact form endpoint with honeypot and rate limiting."""

from fastapi import APIRouter, Depends, status

from src.schemas.contact import ContactRequest, ContactResponse
from src.services.contact_service import ContactService, get_contact_service
from src.utils.rate_limit import enforce_contact_rate_limit

router = APIRouter(prefix="/contact", tags=["contact"])

_ACK = ContactResponse(detail="Message received. Thank you!")


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(enforce_contact_rate_limit)],
)
def submit_contact(
    payload: ContactRequest,
    service: ContactService = Depends(get_contact_service),
) -> ContactResponse:
    """Accept a contact form submission and email it via SES.

    Submissions with a filled honeypot field are acknowledged with the
    same response but silently discarded, so bots learn nothing.

    Parameters
    ----------
    payload : ContactRequest
        Validated contact form data.
    service : ContactService
        Injected contact service.

    Returns
    -------
    ContactResponse
        Generic acknowledgement.
    """
    if payload.website:
        return _ACK
    service.send_contact_email(payload)
    return _ACK
