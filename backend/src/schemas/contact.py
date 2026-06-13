"""Request/response models for the contact form."""

from pydantic import BaseModel, Field

_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


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
