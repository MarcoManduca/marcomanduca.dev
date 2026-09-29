"""Contact form email delivery via AWS SES."""

import logging
from functools import lru_cache

from botocore.exceptions import BotoCoreError, ClientError

from src.config import get_settings
from src.schemas.contact import ContactRequest
from src.services.errors import EmailDeliveryError
from src.utils.aws_clients import get_client
from src.utils.sanitize import strip_control_chars, truncate

logger = logging.getLogger(__name__)

_SUBJECT_MAX_LENGTH = 150
_CHARSET = "UTF-8"


class ContactService:
    """Send contact form submissions to the site owner via SES."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = get_client("ses", settings.aws_region)
        self._sender = settings.ses_sender_email
        self._recipient = settings.ses_recipient_email

    def send_contact_email(self, payload: ContactRequest) -> None:
        """Deliver a contact message to the configured recipient.

        The visitor address is set as ``Reply-To`` so the owner can
        answer directly; the SES ``Source`` stays a verified identity.
        Control characters (CR, LF, ...) are stripped from the sender name
        and the subject is capped at 150 characters. Subject and body are
        sent as UTF-8: without a charset SES expects 7-bit ASCII, which
        would garble accented Italian text.

        Parameters
        ----------
        payload : ContactRequest
            Validated, non-spam contact submission.

        Raises
        ------
        EmailDeliveryError
            When SES rejects or fails to accept the message.
        """
        name = strip_control_chars(payload.name)
        subject = truncate(f"[Portfolio] Message from {name}", _SUBJECT_MAX_LENGTH)
        body = (
            f"New contact message from marcomanduca.dev\n\n"
            f"Name: {name}\n"
            f"Email: {payload.email}\n\n"
            f"{payload.message}\n"
        )
        try:
            self._client.send_email(
                Source=self._sender,
                Destination={"ToAddresses": [self._recipient]},
                ReplyToAddresses=[payload.email],
                Message={
                    "Subject": {"Data": subject, "Charset": _CHARSET},
                    "Body": {"Text": {"Data": body, "Charset": _CHARSET}},
                },
            )
        except (ClientError, BotoCoreError) as exc:
            logger.error("ses_send_failed", extra={"error_type": type(exc).__name__})
            message = "Unable to deliver the message right now."
            raise EmailDeliveryError(message) from exc


@lru_cache
def get_contact_service() -> ContactService:
    """Return the cached :class:`ContactService`.

    Built once per execution environment so boto3 objects are reused
    across requests; tests clear it with ``cache_clear()``.

    Returns
    -------
    ContactService
        Shared service instance.
    """
    return ContactService()
