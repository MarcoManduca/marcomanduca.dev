"""Project-wide fixtures: environment, moto AWS backend, API clients."""

import os
from collections.abc import AsyncIterator, Callable, Iterator
from typing import Any

import boto3
import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from moto import mock_aws

from src.config import get_settings
from src.main import create_app
from src.utils.auth import optional_admin, require_admin
from src.utils.rate_limit import reset_contact_limiter

_TEST_ENV = {
    "AWS_ACCESS_KEY_ID": "testing",
    "AWS_SECRET_ACCESS_KEY": "testing",
    "AWS_SECURITY_TOKEN": "testing",
    "AWS_SESSION_TOKEN": "testing",
    "AWS_DEFAULT_REGION": "eu-west-1",
    "AWS_REGION": "eu-west-1",
    "PROJECTS_TABLE_NAME": "test-projects",
    "LEARNING_TABLE_NAME": "test-learning",
    "TECHNOLOGIES_TABLE_NAME": "test-technologies",
    "RATELIMIT_TABLE_NAME": "test-ratelimit",
    "MEDIA_BUCKET_NAME": "test-media-bucket",
    "COGNITO_USER_POOL_ID": "eu-west-1_testpool",
    "COGNITO_CLIENT_ID": "test-client-id",
    "SES_SENDER_EMAIL": "noreply@test.dev",
    "SES_RECIPIENT_EMAIL": "owner@test.dev",
    "CONTACT_RATE_LIMIT_MAX_REQUESTS": "5",
    "CONTACT_RATE_LIMIT_WINDOW_SECONDS": "900",
}


@pytest.fixture(autouse=True)
def test_environment(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Isolate settings and limiter state for every test."""
    for key, value in _TEST_ENV.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()
    reset_contact_limiter()
    yield
    get_settings.cache_clear()
    reset_contact_limiter()


@pytest.fixture
def aws_backend() -> Iterator[None]:
    """Start moto and provision tables, bucket and SES identity."""
    with mock_aws():
        _create_tables()
        _create_bucket()
        _verify_ses_sender()
        yield


@pytest.fixture
def app(aws_backend: None) -> FastAPI:
    """Build the application against the moto backend."""
    return create_app()


@pytest.fixture
async def public_client(app: FastAPI) -> AsyncIterator[AsyncClient]:
    """Unauthenticated API client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def admin_claims() -> dict[str, Any]:
    """Fake verified claims of an administrator."""
    return {
        "username": "marco",
        "client_id": "test-client-id",
        "token_use": "access",
        "cognito:groups": ["Administrators"],
    }


@pytest.fixture
async def admin_client(
    aws_backend: None, admin_claims: dict[str, Any]
) -> AsyncIterator[AsyncClient]:
    """API client with the auth dependencies overridden as admin.

    Built on a dedicated app instance so the admin overrides never leak
    into the shared ``public_client`` app. Both apps target the same moto
    backend, so content created here is visible to public callers.
    """
    admin_app = create_app()
    admin_app.dependency_overrides[require_admin] = lambda: admin_claims
    admin_app.dependency_overrides[optional_admin] = lambda: admin_claims
    transport = ASGITransport(app=admin_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    admin_app.dependency_overrides.clear()


@pytest.fixture
def project_payload_factory() -> Callable[..., dict[str, Any]]:
    """Factory building valid project payloads with overrides."""

    def _make(**overrides: Any) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "title": {"it": "Progetto Demo", "en": "Demo Project"},
            "description": {"it": "Descrizione", "en": "Description"},
            "content_markdown": {"it": "# Contenuto", "en": "# Content"},
            "technologies": ["fastapi"],
            "category": "backend",
            "images": [],
            "github_url": "https://github.com/marco/demo",
            "demo_url": None,
            "status": "published",
        }
        payload.update(overrides)
        return payload

    return _make


@pytest.fixture
def article_payload_factory() -> Callable[..., dict[str, Any]]:
    """Factory building valid learning article payloads with overrides."""

    def _make(**overrides: Any) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "title": {"it": "Articolo Demo", "en": "Demo Article"},
            "content_markdown": {"it": "# Nota", "en": "# Note"},
            "category": "SWE",
            "tags": ["python"],
            "status": "published",
        }
        payload.update(overrides)
        return payload

    return _make


def _create_tables() -> None:
    """Create the three DynamoDB tables used by the application."""
    dynamodb = boto3.client("dynamodb", region_name=os.environ["AWS_REGION"])
    dynamodb.create_table(
        TableName=os.environ["PROJECTS_TABLE_NAME"],
        KeySchema=[{"AttributeName": "slug", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "slug", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    dynamodb.create_table(
        TableName=os.environ["LEARNING_TABLE_NAME"],
        KeySchema=[
            {"AttributeName": "slug", "KeyType": "HASH"},
            {"AttributeName": "version", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "slug", "AttributeType": "S"},
            {"AttributeName": "version", "AttributeType": "N"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )
    dynamodb.create_table(
        TableName=os.environ["TECHNOLOGIES_TABLE_NAME"],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    dynamodb.create_table(
        TableName=os.environ["RATELIMIT_TABLE_NAME"],
        KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )


def _create_bucket() -> None:
    """Create the media bucket in moto S3."""
    s3 = boto3.client("s3", region_name=os.environ["AWS_REGION"])
    s3.create_bucket(
        Bucket=os.environ["MEDIA_BUCKET_NAME"],
        CreateBucketConfiguration={"LocationConstraint": os.environ["AWS_REGION"]},
    )


def _verify_ses_sender() -> None:
    """Verify the SES sender identity in moto."""
    ses = boto3.client("ses", region_name=os.environ["AWS_REGION"])
    ses.verify_email_identity(EmailAddress=os.environ["SES_SENDER_EMAIL"])
