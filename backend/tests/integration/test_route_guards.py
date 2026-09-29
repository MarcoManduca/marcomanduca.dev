"""Every privileged route rejects anonymous callers.

The routes come from the app's own OpenAPI schema, so a new endpoint that
forgets ``Depends(require_admin)`` fails here instead of shipping public.
"""

import pytest
from httpx import AsyncClient

from src.main import app

pytestmark = pytest.mark.integration

_PUBLIC_WRITES = {("POST", "/api/v1/contact")}
# Reads that expose admin-only data.
_ADMIN_READS = [("GET", "/api/v1/learning/{slug}/versions")]
# A request body that parses, so the auth dependency is what answers.
_EMPTY_BODY = "{}"


def _admin_routes() -> list[tuple[str, str]]:
    """Every write in the schema except the public ones, plus admin reads."""
    writes = [
        (method.upper(), path)
        for path, operations in app.openapi()["paths"].items()
        for method in operations
        if method != "get"
    ]
    return sorted(set(writes) - _PUBLIC_WRITES) + _ADMIN_READS


_ADMIN_ROUTES = _admin_routes()


def test_the_audit_covers_every_admin_endpoint() -> None:
    # Assert: POST/PUT/DELETE projects, learning (+ rollback, versions),
    # POST/DELETE technologies and the media presign.
    assert len(_ADMIN_ROUTES) == 11


@pytest.mark.parametrize("route", _ADMIN_ROUTES, ids="{0[0]} {0[1]}".format)
async def test_privileged_route_rejects_anonymous_callers(
    public_client: AsyncClient, route: tuple[str, str]
) -> None:
    # Arrange
    method, template = route
    path = template.replace("{slug}", "demo").replace("{tech_id}", "demo")

    # Act
    response = await public_client.request(
        method,
        path,
        content=_EMPTY_BODY,
        headers={"Content-Type": "application/json"},
    )

    # Assert
    assert response.status_code == 401
