"""Contact form email delivery via AWS SES."""

import logging

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from src.config import get_settings
from src.schemas.contact import ContactRequest
from src.services.errors import EmailDeliveryError

logger = logging.getLogger(__name__)


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

        Raises
        ------
        EmailDeliveryError
            When SES rejects or fails to accept the message.
        """
        body = (
            f"New contact message from marcomanduca.dev\n\n"
            f"Name: {payload.name}\n"
            f"Email: {payload.email}\n\n"
            f"{payload.message}\n"
        )
        try:
            self._client.send_email(
                Source=self._sender,
                Destination={"ToAddresses": [self._recipient]},
                ReplyToAddresses=[payload.email],
                Message={
                    "Subject": {"Data": f"[Portfolio] Message from {payload.name}"},
                    "Body": {"Text": {"Data": body}},
                },
            )
        except (ClientError, BotoCoreError) as exc:
            logger.error("ses_send_failed", extra={"error_type": type(exc).__name__})
            message = "Unable to deliver the message right now."
            raise EmailDeliveryError(message) from exc


def get_contact_service() -> ContactService:
    """Build a request-scoped :class:`ContactService`.

    Returns
    -------
    ContactService
        Service bound to a fresh SES client.
    """
    return ContactService()
