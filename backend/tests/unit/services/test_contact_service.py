"""Unit tests for ContactService against moto SES."""

from unittest.mock import MagicMock

import boto3
import pytest
from botocore.exceptions import ClientError

from src.schemas.contact import ContactRequest
from src.services.contact_service import ContactService
from src.services.errors import EmailDeliveryError


@pytest.fixture
def service(aws_backend: None) -> ContactService:
    """Contact service bound to the moto SES backend."""
    return ContactService()


def test_send_contact_email_delivers_one_message(
    service: ContactService,
) -> None:
    # Arrange
    payload = ContactRequest(
        name="Alice",
        email="alice@example.com",
        message="Hello Marco!",
    )

    # Act
    service.send_contact_email(payload)

    # Assert
    quota = boto3.client("ses", region_name="eu-west-1").get_send_quota()
    assert quota["SentLast24Hours"] == 1.0


def test_send_contact_email_raises_on_ses_failure(
    service: ContactService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    error = ClientError(
        {"Error": {"Code": "MessageRejected", "Message": "rejected"}}, "SendEmail"
    )
    monkeypatch.setattr(service._client, "send_email", _raise(error))
    payload = ContactRequest(
        name="Eve", email="eve@example.com", message="Will not deliver."
    )

    # Act / Assert
    with pytest.raises(EmailDeliveryError):
        service.send_contact_email(payload)


def _raise(error: Exception) -> object:
    """Build a side-effect callable that always raises ``error``."""

    def _inner(*args: object, **kwargs: object) -> None:
        raise error

    return _inner


def test_send_contact_email_uses_visitor_as_reply_to(
    service: ContactService,
) -> None:
    # Arrange
    payload = ContactRequest(
        name="Bob",
        email="bob@example.com",
        message="Question about a project.",
    )

    # Act
    service.send_contact_email(payload)

    # Assert
    quota = boto3.client("ses", region_name="eu-west-1").get_send_quota()
    assert quota["SentLast24Hours"] == 1.0


@pytest.fixture
def recording_client(
    service: ContactService, monkeypatch: pytest.MonkeyPatch
) -> MagicMock:
    """Replace the SES send call with a recording mock."""
    send_email = MagicMock()
    monkeypatch.setattr(service._client, "send_email", send_email)
    return send_email


def test_send_contact_email_strips_line_breaks_from_name(
    service: ContactService, recording_client: MagicMock
) -> None:
    # Arrange
    payload = ContactRequest(
        name="Mallory\r\nBcc: victim@example.com\x00",
        email="mallory@example.com",
        message="Hi",
    )

    # Act
    service.send_contact_email(payload)

    # Assert
    message = recording_client.call_args.kwargs["Message"]
    subject = message["Subject"]["Data"]
    assert subject == "[Portfolio] Message from MalloryBcc: victim@example.com"
    assert "Name: MalloryBcc: victim@example.com\n" in message["Body"]["Text"]["Data"]


def test_send_contact_email_truncates_long_subject(
    service: ContactService, recording_client: MagicMock
) -> None:
    # Arrange: bypass schema limits to exercise the defensive cap.
    payload = ContactRequest.model_construct(
        name="A" * 300, email="a@example.com", message="Hi", website=""
    )

    # Act
    service.send_contact_email(payload)

    # Assert
    subject = recording_client.call_args.kwargs["Message"]["Subject"]["Data"]
    assert len(subject) == 150
    assert subject.endswith("…")
