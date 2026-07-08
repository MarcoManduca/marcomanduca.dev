"""Integration tests for the X-Origin-Verify CloudFront check."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from src.config import get_settings
from src.main import create_app

pytestmark = pytest.mark.integration


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
        response = await client.get("/api/v1/health")

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
            "/api/v1/health", headers={"X-Origin-Verify": "s3cret"}
        )

    # Assert
    assert response.status_code == 200
