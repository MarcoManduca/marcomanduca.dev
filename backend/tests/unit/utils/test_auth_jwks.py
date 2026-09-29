"""Cognito token validation through the real JWKS client (fetch stubbed).

Unlike ``test_auth.py``, the signing key is resolved by ``PyJWKClient``
from a JWKS document, so key-id matching and fetch failures are covered.
"""

import time
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from fastapi import HTTPException
from jwt.algorithms import RSAAlgorithm

from src.utils.auth import decode_token

_ISSUER = "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_testpool"
_KID = "test-key-1"


@pytest.fixture(scope="module")
def rsa_key() -> RSAPrivateKey:
    """Module-wide RSA key pair published in the stubbed JWKS."""
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture
def jwks(rsa_key: RSAPrivateKey) -> dict[str, Any]:
    """JWKS document holding the test public key."""
    jwk = RSAAlgorithm.to_jwk(rsa_key.public_key(), as_dict=True)
    return {"keys": [jwk | {"kid": _KID, "alg": "RS256", "use": "sig"}]}


def _token(key: RSAPrivateKey, kid: str) -> str:
    """Sign a valid access token with the given key id."""
    now = int(time.time())
    claims = {
        "iss": _ISSUER,
        "client_id": "test-client-id",
        "token_use": "access",
        "iat": now,
        "exp": now + 3600,
    }
    return jwt.encode(claims, key, algorithm="RS256", headers={"kid": kid})


def _raise_connection_error(self: jwt.PyJWKClient) -> None:
    """Stand-in for a JWKS endpoint that cannot be reached."""
    raise jwt.PyJWKClientConnectionError("unreachable")


def test_decode_token_accepts_a_token_signed_by_a_published_key(
    monkeypatch: pytest.MonkeyPatch, rsa_key: RSAPrivateKey, jwks: dict[str, Any]
) -> None:
    # Arrange
    monkeypatch.setattr(jwt.PyJWKClient, "fetch_data", lambda self: jwks)

    # Act
    claims = decode_token(_token(rsa_key, _KID))

    # Assert
    assert claims["client_id"] == "test-client-id"


def test_decode_token_rejects_an_unknown_key_id(
    monkeypatch: pytest.MonkeyPatch, rsa_key: RSAPrivateKey, jwks: dict[str, Any]
) -> None:
    # Arrange
    monkeypatch.setattr(jwt.PyJWKClient, "fetch_data", lambda self: jwks)

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(_token(rsa_key, "rotated-away"))
    assert exc_info.value.status_code == 401


def test_decode_token_answers_401_when_the_jwks_is_unreachable(
    monkeypatch: pytest.MonkeyPatch, rsa_key: RSAPrivateKey
) -> None:
    # Arrange
    monkeypatch.setattr(jwt.PyJWKClient, "fetch_data", _raise_connection_error)

    # Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        decode_token(_token(rsa_key, _KID))
    assert exc_info.value.status_code == 401
