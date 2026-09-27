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
        "alice@example.com,",
        "alice@example.com, bob@example.com",
        "alice@example..com",
        "alice..smith@example.com",
        ".alice@example.com",
        "alice@-example.com",
        "alice@example.c0m",
        "al\u00efce@example.com",
        "alice@ex\u00e4mple.com",
        "<alice@example.com>",
    ],
)
def test_contact_request_rejects_invalid_email(email: str) -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        ContactRequest(name="Alice", email=email, message="Hello!")


@pytest.mark.parametrize(
    "email",
    [
        "alice.smith@example.com",
        "alice+contact@mail.example.co.uk",
        "o'brien@example.ie",
        "a_b-c@sub-domain.example.dev",
    ],
)
def test_contact_request_accepts_valid_email(email: str) -> None:
    # Act
    payload = ContactRequest(name="Alice", email=email, message="Hello!")

    # Assert
    assert payload.email == email


def test_contact_request_rejects_empty_message() -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        ContactRequest(name="Alice", email="alice@example.com", message="")
