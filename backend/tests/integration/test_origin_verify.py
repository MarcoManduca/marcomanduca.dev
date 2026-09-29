"""Integration tests for the X-Origin-Verify CloudFront check."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from src.config import get_settings
from src.main import create_app

pytestmark = pytest.mark.integration

# Any route other than the exempt readiness probe (GET /api/v1/health).
_PROTECTED_PATH = "/api/v1/technologies"


async def _client(app: FastAPI) -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def test_health_allowed_without_header_when_secret_disabled(
    public_client: AsyncClient,
) -> None:
    # Arrange: default test env leaves ORIGIN_VERIFY_SECRET empty (disabled).

    # Act
    response = await public_client.get("/api/v1/health")

    # Assert
    assert response.status_code == 200


async def test_request_rejected_when_secret_set_and_header_missing(
    aws_backend: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "s3cret")
    get_settings.cache_clear()
    app = create_app()

    # Act
    async with await _client(app) as client:
        response = await client.get(_PROTECTED_PATH)

    # Assert
    assert response.status_code == 403


async def test_request_allowed_when_secret_set_and_header_matches(
    aws_backend: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "s3cret")
    get_settings.cache_clear()
    app = create_app()

    # Act
    async with await _client(app) as client:
        response = await client.get(
            _PROTECTED_PATH, headers={"X-Origin-Verify": "s3cret"}
        )

    # Assert
    assert response.status_code == 200


@pytest.mark.parametrize(
    "header", [b"wrong", b"s3cre", b"s3cret-extra", "sécret".encode()]
)
async def test_request_rejected_when_header_does_not_match(
    aws_backend: None, monkeypatch: pytest.MonkeyPatch, header: bytes
) -> None:
    # Arrange
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "s3cret")
    get_settings.cache_clear()
    app = create_app()

    # Act
    async with await _client(app) as client:
        response = await client.get(
            _PROTECTED_PATH, headers={"X-Origin-Verify": header}
        )

    # Assert
    assert response.status_code == 403


@pytest.mark.parametrize(
    "header, expected_status",
    [
        ("new-secret", 200),
        ("old-secret", 200),
        ("other", 403),
    ],
)
async def test_previous_secret_is_accepted_during_a_rotation(
    aws_backend: None,
    monkeypatch: pytest.MonkeyPatch,
    header: str,
    expected_status: int,
) -> None:
    # Arrange
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "new-secret")
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET_PREVIOUS", "old-secret")
    get_settings.cache_clear()
    app = create_app()

    # Act
    async with await _client(app) as client:
        response = await client.get(
            _PROTECTED_PATH, headers={"X-Origin-Verify": header}
        )

    # Assert
    assert response.status_code == expected_status


async def test_previous_secret_alone_does_not_enable_the_check(
    aws_backend: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Arrange: a leftover previous value must not lock out local development.
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "")
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET_PREVIOUS", "old-secret")
    get_settings.cache_clear()
    app = create_app()

    # Act
    async with await _client(app) as client:
        response = await client.get(_PROTECTED_PATH)

    # Assert
    assert response.status_code == 200


@pytest.fixture
async def guarded_client(
    aws_backend: None, monkeypatch: pytest.MonkeyPatch
) -> AsyncClient:
    """Client for an app that requires the origin secret."""
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "s3cret")
    get_settings.cache_clear()
    return await _client(create_app())


async def test_readiness_probe_reaches_health_without_the_header(
    guarded_client: AsyncClient,
) -> None:
    # Act
    async with guarded_client as client:
        response = await client.get("/api/v1/health")

    # Assert
    assert response.status_code == 200


@pytest.mark.parametrize(
    "method, path",
    [
        ("HEAD", "/api/v1/health"),
        ("POST", "/api/v1/health"),
        ("GET", "/api/v1/health/"),
    ],
)
async def test_only_get_health_is_exempt(
    guarded_client: AsyncClient, method: str, path: str
) -> None:
    # Act
    async with guarded_client as client:
        response = await client.request(method, path)

    # Assert
    assert response.status_code == 403
