"""Integration tests for environment-dependent app wiring (docs, secret)."""

import pytest
from httpx import ASGITransport, AsyncClient

from src.config import get_settings
from src.main import create_app
from src.utils.origin_verify import MissingOriginSecretError

pytestmark = pytest.mark.integration

_SECRET = "s3cret"


@pytest.fixture
def prod_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Switch settings to prod with an origin secret configured."""
    monkeypatch.setenv("APP_ENV", "prod")
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", _SECRET)
    get_settings.cache_clear()


def test_create_app_refuses_prod_without_origin_secret(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    monkeypatch.setenv("APP_ENV", "prod")
    monkeypatch.setenv("ORIGIN_VERIFY_SECRET", "")
    get_settings.cache_clear()

    # Act / Assert
    with pytest.raises(MissingOriginSecretError):
        create_app()


def test_settings_default_to_prod_when_app_env_is_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    monkeypatch.delenv("APP_ENV", raising=False)
    get_settings.cache_clear()

    # Act
    settings = get_settings()

    # Assert
    assert settings.is_prod is True


@pytest.mark.parametrize("path", ["/docs", "/redoc", "/openapi.json"])
async def test_docs_are_disabled_in_prod(
    aws_backend: None, prod_env: None, path: str
) -> None:
    # Arrange
    app = create_app()
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(path, headers={"X-Origin-Verify": _SECRET})

    # Assert
    assert response.status_code == 404


@pytest.mark.parametrize("path", ["/docs", "/redoc", "/openapi.json"])
async def test_docs_are_served_locally(public_client: AsyncClient, path: str) -> None:
    # Act
    response = await public_client.get(path)

    # Assert
    assert response.status_code == 200
