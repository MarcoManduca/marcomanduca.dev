"""AWS Cognito JWT validation dependencies.

Access tokens are verified against the user pool JWKS (RS256 signature,
issuer, expiry, ``token_use`` and ``client_id`` claims); the ``exp``,
``iat``, ``iss``, ``client_id`` and ``token_use`` claims are mandatory.
Admin-only routes also require membership of the ``Administrators``
Cognito group.
"""

from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.config import Settings, get_settings

ADMIN_GROUP = "Administrators"
_REQUIRED_CLAIMS = ["exp", "iat", "iss", "client_id", "token_use"]

_bearer = HTTPBearer()
_optional_bearer = HTTPBearer(auto_error=False)


@lru_cache
def _get_jwks_client(jwks_url: str) -> jwt.PyJWKClient:
    """Return a cached JWKS client for the given URL."""
    return jwt.PyJWKClient(jwks_url, cache_keys=True)


def _issuer(settings: Settings) -> str:
    """Build the expected Cognito issuer URL."""
    return (
        f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )


def _get_signing_key(token: str) -> Any:
    """Resolve the public signing key for a token via the pool JWKS."""
    settings = get_settings()
    jwks_url = f"{_issuer(settings)}/.well-known/jwks.json"
    return _get_jwks_client(jwks_url).get_signing_key_from_jwt(token).key


def decode_token(token: str) -> dict[str, Any]:
    """Validate a Cognito access token and return its claims.

    Parameters
    ----------
    token : str
        Raw JWT extracted from the ``Authorization`` header.

    Returns
    -------
    dict[str, Any]
        Verified token claims.

    Raises
    ------
    fastapi.HTTPException
        With status 401 when the token is invalid.
    """
    settings = get_settings()
    try:
        claims: dict[str, Any] = jwt.decode(
            token,
            _get_signing_key(token),
            algorithms=["RS256"],
            issuer=_issuer(settings),
            # Cognito access tokens carry ``client_id`` instead of ``aud``.
            options={"verify_aud": False, "require": _REQUIRED_CLAIMS},
        )
    except jwt.PyJWTError as exc:
        raise _unauthorized("Invalid authentication token.") from exc
    if claims.get("token_use") != "access":
        raise _unauthorized("Token is not an access token.")
    if claims.get("client_id") != settings.cognito_client_id:
        raise _unauthorized("Token was issued for another client.")
    return claims


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict[str, Any]:
    """FastAPI dependency returning the verified token claims.

    Parameters
    ----------
    credentials : HTTPAuthorizationCredentials
        Bearer credentials injected by FastAPI.

    Returns
    -------
    dict[str, Any]
        Verified Cognito claims of the caller.
    """
    return decode_token(credentials.credentials)


def require_admin(
    claims: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """FastAPI dependency that only admits Cognito administrators.

    Parameters
    ----------
    claims : dict[str, Any]
        Verified claims from :func:`get_current_user`.

    Returns
    -------
    dict[str, Any]
        The same claims, when the caller belongs to the admin group.

    Raises
    ------
    fastapi.HTTPException
        With status 403 when the caller is not an administrator.
    """
    groups = claims.get("cognito:groups") or []
    if ADMIN_GROUP not in groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required.",
        )
    return claims


def optional_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
) -> dict[str, Any] | None:
    """FastAPI dependency yielding admin claims when present.

    Anonymous callers receive ``None`` so public endpoints can degrade
    gracefully (for example by hiding draft content). Invalid tokens are
    still rejected with 401.

    Parameters
    ----------
    credentials : HTTPAuthorizationCredentials or None
        Optional bearer credentials.

    Returns
    -------
    dict[str, Any] or None
        Admin claims, or ``None`` for anonymous / non-admin callers.
    """
    if credentials is None:
        return None
    claims = decode_token(credentials.credentials)
    groups = claims.get("cognito:groups") or []
    return claims if ADMIN_GROUP in groups else None


def _unauthorized(detail: str) -> HTTPException:
    """Build a 401 error with the WWW-Authenticate header set."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
