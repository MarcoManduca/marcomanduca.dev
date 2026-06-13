"""Contact form email delivery via AWS SES."""

import boto3

from src.config import get_settings
from src.schemas.contact import ContactRequest


class ContactService:
    """Send contact form submissions to the site owner via SES."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = boto3.client("ses", region_name=settings.aws_region)
        self._sender = settings.ses_sender_email
        self._recipient = settings.ses_recipient_email

    def send_contact_email(self, payload: ContactRequest) -> None:
        """Deliver a contact message to the configured recipient.

        The visitor address is set as ``Reply-To`` so the owner can
        answer directly; the SES ``Source`` stays a verified identity.

        Parameters
        ----------
        payload : ContactRequest
            Validated, non-spam contact submission.
        """
        body = (
            f"New contact message from marcomanduca.dev\n\n"
            f"Name: {payload.name}\n"
            f"Email: {payload.email}\n\n"
            f"{payload.message}\n"
        )
        self._client.send_email(
            Source=self._sender,
            Destination={"ToAddresses": [self._recipient]},
            ReplyToAddresses=[payload.email],
            Message={
                "Subject": {"Data": f"[Portfolio] Message from {payload.name}"},
                "Body": {"Text": {"Data": body}},
            },
        )


def get_contact_service() -> ContactService:
    """Build a request-scoped :class:`ContactService`.

    Returns
    -------
    ContactService
        Service bound to a fresh SES client.
    """
    return ContactService()
