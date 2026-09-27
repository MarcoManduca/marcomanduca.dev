"""API tests through the real Cognito auth dependencies (JWKS mocked only)."""

import time
from collections.abc import Callable
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from httpx import AsyncClient

pytestmark = pytest.mark.integration

_ISSUER = "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_testpool"
_UPLOAD_PAYLOAD = {
    "prefix": "images/projects/",
    "filename": "shot.png",
    "content_type": "image/png",
    "content_length": 2048,
}


@pytest.fixture(scope="module")
def signing_key() -> RSAPrivateKey:
    """RSA key standing in for the Cognito user pool signing key."""
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture(autouse=True)
def mocked_jwks(monkeypatch: pytest.MonkeyPatch, signing_key: RSAPrivateKey) -> None:
    """Serve the test public key instead of fetching the pool JWKS."""
    monkeypatch.setattr(
        "src.utils.auth._get_signing_key", lambda token: signing_key.public_key()
    )


@pytest.fixture
def bearer(signing_key: RSAPrivateKey) -> Callable[..., dict[str, str]]:
    """Factory for Authorization headers carrying signed access tokens."""

    def _make(**overrides: Any) -> dict[str, str]:
        now = int(time.time())
        claims: dict[str, Any] = {
            "iss": _ISSUER,
            "client_id": "test-client-id",
            "token_use": "access",
            "username": "marco",
            "iat": now,
            "exp": now + 3600,
        }
        claims.update(overrides)
        token = jwt.encode(claims, signing_key, algorithm="RS256")
        return {"Authorization": f"Bearer {token}"}

    return _make


@pytest.mark.parametrize(
    "overrides, expected_status",
    [
        ({"cognito:groups": ["Administrators"]}, 200),
        ({"cognito:groups": ["Users"]}, 403),
        ({}, 403),
        ({"cognito:groups": ["Administrators"], "client_id": "other"}, 401),
        ({"cognito:groups": ["Administrators"], "exp": int(time.time()) - 60}, 401),
    ],
)
async def test_presign_upload_enforces_real_admin_dependency(
    public_client: AsyncClient,
    bearer: Callable[..., dict[str, str]],
    overrides: dict[str, Any],
    expected_status: int,
) -> None:
    # Act
    response = await public_client.post(
        "/api/v1/media/presign", json=_UPLOAD_PAYLOAD, headers=bearer(**overrides)
    )

    # Assert
    assert response.status_code == expected_status


async def test_list_projects_shows_drafts_to_real_admin_token(
    public_client: AsyncClient,
    bearer: Callable[..., dict[str, str]],
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    admin = bearer(**{"cognito:groups": ["Administrators"]})
    draft = project_payload_factory(status="draft")
    await public_client.post("/api/v1/projects", json=draft, headers=admin)

    # Act
    anonymous = await public_client.get("/api/v1/projects")
    as_admin = await public_client.get("/api/v1/projects", headers=admin)

    # Assert
    assert anonymous.json() == []
    assert [item["slug"] for item in as_admin.json()] == ["demo-project"]
