"""Project-wide fixtures: environment, moto AWS backend, API clients."""

import os

# ``src.main`` builds the app at import time and prod (the default) refuses to
# start without an origin secret, so the local env must be set before import.
os.environ.setdefault("APP_ENV", "local")

from collections.abc import AsyncIterator, Callable, Iterator  # noqa: E402
from typing import Any  # noqa: E402

import boto3  # noqa: E402
import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from moto import mock_aws  # noqa: E402

from src.config import get_settings  # noqa: E402
from src.main import create_app  # noqa: E402
from src.services.contact_service import get_contact_service  # noqa: E402
from src.services.learning_service import get_learning_service  # noqa: E402
from src.services.media_service import get_media_service  # noqa: E402
from src.services.project_service import get_project_service  # noqa: E402
from src.services.technology_service import get_technology_service  # noqa: E402
from src.utils.auth import _get_jwks_client, optional_admin, require_admin  # noqa: E402
from src.utils.aws_clients import clear_aws_caches  # noqa: E402
from src.utils.rate_limit import reset_contact_limiter  # noqa: E402

_SERVICE_FACTORIES = (
    get_contact_service,
    get_learning_service,
    get_media_service,
    get_project_service,
    get_technology_service,
)

_TEST_ENV = {
    "APP_ENV": "local",
    "AWS_ACCESS_KEY_ID": "testing",
    "AWS_SECRET_ACCESS_KEY": "testing",
    "AWS_SECURITY_TOKEN": "testing",
    "AWS_SESSION_TOKEN": "testing",
    "AWS_DEFAULT_REGION": "eu-west-1",
    "AWS_REGION": "eu-west-1",
    # Empty beats a DynamoDB Local endpoint in backend/.env: tests stay on moto.
    "DYNAMODB_ENDPOINT_URL": "",
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
    "CONTACT_RATE_LIMIT_DAILY_MAX": "50",
    # Pinned so a local backend/.env cannot leak in (an origin secret there
    # would turn every integration test into a 403).
    "ORIGIN_VERIFY_SECRET": "",
    "ORIGIN_VERIFY_SECRET_PREVIOUS": "",
    "PRESIGN_EXPIRATION_SECONDS": "900",
    "LOG_LEVEL": "INFO",
    "CORS_ORIGINS": "http://localhost:5173",
}


@pytest.fixture(autouse=True)
def test_environment(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Isolate settings, cached AWS objects and limiter state per test."""
    for key, value in _TEST_ENV.items():
        monkeypatch.setenv(key, value)
    _clear_caches()
    yield
    _clear_caches()


def _clear_caches() -> None:
    """Drop cached settings, boto3 and JWKS clients, services, the limiter."""
    get_settings.cache_clear()
    clear_aws_caches()
    _get_jwks_client.cache_clear()
    for factory in _SERVICE_FACTORIES:
        factory.cache_clear()
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
            "areas": ["backend"],
            "context": "personal",
            "metrics": [{"value": "3", "label": {"it": "servizi", "en": "services"}}],
            "technologies": ["fastapi"],
            "brief": {
                "objective": {"it": "Obiettivo", "en": "Objective"},
                "boss": {"it": "Ostacolo", "en": "Obstacle"},
                "rewards": {"it": "Risultato", "en": "Outcome"},
            },
            "content_markdown": {"it": "# Contenuto", "en": "# Content"},
            "links": [{"kind": "repo", "url": "https://github.com/marco/demo"}],
            "license": "MIT",
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
