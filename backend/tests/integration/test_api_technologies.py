"""Integration tests for the technologies API."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration

_PAYLOAD = {"name": "FastAPI", "icon": "fastapi.svg", "category": "backend"}


async def test_create_technology_returns_201_with_admin_token(
    admin_client: AsyncClient,
) -> None:
    # Act
    response = await admin_client.post("/api/v1/technologies", json=_PAYLOAD)

    # Assert
    assert response.status_code == 201
    assert response.json()["id"] == "fastapi"


async def test_create_technology_returns_401_without_token(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.post("/api/v1/technologies", json=_PAYLOAD)

    # Assert
    assert response.status_code == 401


async def test_list_technologies_is_public(
    admin_client: AsyncClient, public_client: AsyncClient
) -> None:
    # Arrange
    await admin_client.post("/api/v1/technologies", json=_PAYLOAD)

    # Act
    response = await public_client.get("/api/v1/technologies")

    # Assert
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == ["fastapi"]


async def test_delete_technology_returns_204(
    admin_client: AsyncClient,
) -> None:
    # Arrange
    await admin_client.post("/api/v1/technologies", json=_PAYLOAD)

    # Act
    response = await admin_client.delete("/api/v1/technologies/fastapi")

    # Assert
    assert response.status_code == 204
