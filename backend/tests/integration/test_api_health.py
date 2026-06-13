"""Integration test for the health endpoint."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_get_health_returns_ok(public_client: AsyncClient) -> None:
    # Act
    response = await public_client.get("/api/v1/health")

    # Assert
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
