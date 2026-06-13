"""Unit tests for contact form validation."""

import pytest
from pydantic import ValidationError

from src.schemas.contact import ContactRequest


def test_contact_request_accepts_valid_payload() -> None:
    # Act
    payload = ContactRequest(name="Alice", email="alice@example.com", message="Hello!")

    # Assert
    assert payload.website == ""


@pytest.mark.parametrize(
    "email",
    [
        "not-an-email",
        "missing-domain@",
        "@missing-local.com",
        "spaces in@example.com",
        "no-tld@example",
    ],
)
def test_contact_request_rejects_invalid_email(email: str) -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        ContactRequest(name="Alice", email=email, message="Hello!")


def test_contact_request_rejects_empty_message() -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        ContactRequest(name="Alice", email="alice@example.com", message="")
