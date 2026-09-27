"""Request/response models for the contact form."""

from pydantic import BaseModel, Field

# ASCII addresses SES accepts: dot-separated RFC 5322 atoms before the "@",
# hostname labels and an alphabetic TLD after it. Anything looser (commas,
# "..", non-ASCII) would pass here and then fail at SES as a 503.
_LOCAL_ATOM = r"[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+"
_DOMAIN_LABEL = r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
_EMAIL_PATTERN = (
    rf"^{_LOCAL_ATOM}(?:\.{_LOCAL_ATOM})*@(?:{_DOMAIN_LABEL}\.)+[A-Za-z]{{2,63}}$"
)


class ContactRequest(BaseModel):
    """Contact form submission.

    The ``website`` field is a honeypot: it is hidden in the UI, so a
    non-empty value marks the submission as spam and no email is sent.

    Attributes
    ----------
    name : str
        Sender display name.
    email : str
        Sender email address (lightweight pattern validation; full
        validation happens on delivery).
    message : str
        Message body.
    website : str
        Honeypot field, must stay empty for legitimate users.
    """

    name: str = Field(min_length=1, max_length=120)
    email: str = Field(pattern=_EMAIL_PATTERN, max_length=254)
    message: str = Field(min_length=1, max_length=5000)
    website: str = Field(default="", max_length=254)


class ContactResponse(BaseModel):
    """Acknowledgement returned to the caller.

    Attributes
    ----------
    detail : str
        Human-readable confirmation message.
    """

    detail: str
