"""Unit tests for ContactService against moto SES."""

import boto3
import pytest

from src.schemas.contact import ContactRequest
from src.services.contact_service import ContactService


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
