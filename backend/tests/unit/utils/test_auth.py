"""Unit tests for Cognito JWT validation (JWKS is mocked)."""

import time
from collections.abc import Callable
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from src.utils.auth import (
    _get_jwks_client,
    decode_token,
    get_current_user,
    optional_admin,
    require_admin,
)

_ISSUER = "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_testpool"


@pytest.fixture(scope="module")
def rsa_key() -> RSAPrivateKey:
    """Module-wide RSA key pair used to sign test tokens."""
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture
def token_factory(rsa_key: RSAPrivateKey) -> Callable[..., str]:
    """Factory building signed tokens with claim overrides."""

    def _make(**overrides: Any) -> str:
        claims: dict[str, Any] = {
            "iss": _ISSUER,
            "client_id": "test-client-id",
            "token_use": "access",
            "username": "marco",
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600,
        }
        claims.update(overrides)
        return jwt.encode(claims, rsa_key, algorithm="RS256")

    return _make


@pytest.fixture(autouse=True)
def mocked_jwks(monkeypatch: pytest.MonkeyPatch, rsa_key: RSAPrivateKey) -> None:
    """Replace the JWKS lookup with the local test public key."""
    monkeypatch.setattr(
        "src.utils.auth._get_signing_key",
        lambda token: rsa_key.public_key(),
    )


def test_decode_token_returns_claims_with_valid_token(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory()

    # Act
    claims = decode_token(token)

    # Assert
    assert claims["username"] == "marco"
    assert claims["client_id"] == "test-client-id"


def test_decode_token_raises_401_on_expired_token(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory(exp=int(time.time()) - 10)

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_wrong_issuer(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory(iss="https://evil.example.com/pool")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_wrong_client_id(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory(client_id="another-client")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_id_token_use(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory(token_use="id")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_get_current_user_returns_claims_from_bearer_credentials(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials=token_factory()
    )

    # Act
    claims = get_current_user(credentials)

    # Assert
    assert claims["username"] == "marco"


def test_require_admin_returns_claims_for_administrator() -> None:
    # Arrange
    claims = {"username": "marco", "cognito:groups": ["Administrators"]}

    # Act
    result = require_admin(claims)

    # Assert
    assert result is claims


def test_require_admin_raises_403_without_admin_group() -> None:
    # Arrange
    claims = {"username": "marco", "cognito:groups": ["Users"]}

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        require_admin(claims)
    assert exc_info.value.status_code == 403


def test_optional_admin_returns_none_without_credentials() -> None:
    # Act
    result = optional_admin(None)

    # Assert
    assert result is None


def test_optional_admin_returns_claims_for_admin_token(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    token = token_factory(**{"cognito:groups": ["Administrators"]})
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Act
    result = optional_admin(credentials)

    # Assert
    assert result is not None
    assert result["username"] == "marco"


def test_optional_admin_returns_none_for_non_admin_token(
    token_factory: Callable[..., str],
) -> None:
    # Arrange
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials=token_factory()
    )

    # Act
    result = optional_admin(credentials)

    # Assert
    assert result is None


def _claims_without(*names: str) -> dict[str, Any]:
    """Valid access-token claims minus the given claim names."""
    now = int(time.time())
    claims: dict[str, Any] = {
        "iss": _ISSUER,
        "client_id": "test-client-id",
        "token_use": "access",
        "iat": now,
        "exp": now + 3600,
    }
    return {key: value for key, value in claims.items() if key not in names}


@pytest.mark.parametrize("missing", ["exp", "iat", "iss", "client_id", "token_use"])
def test_decode_token_raises_401_when_required_claim_is_missing(
    rsa_key: RSAPrivateKey, missing: str
) -> None:
    # Arrange
    token = jwt.encode(_claims_without(missing), rsa_key, algorithm="RS256")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_unsigned_alg_none_token() -> None:
    # Arrange
    token = jwt.encode(_claims_without(), key=None, algorithm="none")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_hs256_token() -> None:
    # Arrange: symmetric signature, as in an algorithm-confusion attack.
    token = jwt.encode(_claims_without(), "a-shared-secret-of-32-bytes-min!", "HS256")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_tampered_payload(
    token_factory: Callable[..., str],
) -> None:
    # Arrange: swap the payload of a valid token for an admin one.
    header, _, signature = token_factory().split(".")
    forged_payload = token_factory(**{"cognito:groups": ["Administrators"]}).split(".")[
        1
    ]
    token = f"{header}.{forged_payload}.{signature}"

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_decode_token_raises_401_on_token_signed_by_another_key() -> None:
    # Arrange
    other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = jwt.encode(_claims_without(), other_key, algorithm="RS256")

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_jwks_client_gives_up_well_before_the_lambda_timeout() -> None:
    # Act
    client = _get_jwks_client("https://cognito.example/jwks.json")

    # Assert: a hung JWKS fetch must end as a 401, not a gateway timeout.
    assert client.timeout < 30
