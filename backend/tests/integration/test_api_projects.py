"""Integration tests for the projects API."""

from collections.abc import Callable
from typing import Any

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_create_project_returns_201_with_admin_token(
    admin_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    response = await admin_client.post(
        "/api/v1/projects", json=project_payload_factory()
    )

    # Assert
    assert response.status_code == 201
    assert response.json()["slug"] == "demo-project"


async def test_create_project_returns_401_without_token(
    public_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    response = await public_client.post(
        "/api/v1/projects", json=project_payload_factory()
    )

    # Assert
    assert response.status_code == 401


async def test_create_project_returns_409_on_duplicate_slug(
    admin_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())

    # Act
    response = await admin_client.post(
        "/api/v1/projects", json=project_payload_factory()
    )

    # Assert
    assert response.status_code == 409


async def test_list_projects_excludes_drafts_for_public_callers(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())
    draft = project_payload_factory(
        title={"it": "Bozza", "en": "Draft Project"}, status="draft"
    )
    await admin_client.post("/api/v1/projects", json=draft)

    # Act
    response = await public_client.get("/api/v1/projects")

    # Assert
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["demo-project"]


async def test_get_project_returns_item_by_slug(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())

    # Act
    response = await public_client.get("/api/v1/projects/demo-project")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["title"]["en"] == "Demo Project"
    assert body["brief"]["objective"]["en"] == "Objective"
    assert body["links"][0]["kind"] == "repo"
    assert body["lab"] is None


async def test_list_projects_returns_cards_without_the_page_content(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())

    # Act
    response = await public_client.get("/api/v1/projects")

    # Assert
    [card] = response.json()
    assert card["repo_url"] == "https://github.com/marco/demo"
    assert "content_markdown" not in card
    assert "brief" not in card


async def test_list_projects_filters_by_area(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())
    data = project_payload_factory(
        title={"it": "Dati", "en": "Data Project"}, areas=["data"]
    )
    await admin_client.post("/api/v1/projects", json=data)

    # Act
    response = await public_client.get("/api/v1/projects", params={"area": "data"})

    # Assert
    assert [item["slug"] for item in response.json()] == ["data-project"]


async def test_list_projects_rejects_an_unknown_area(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get("/api/v1/projects", params={"area": "fullstack"})

    # Assert
    assert response.status_code == 422


async def test_get_project_returns_404_for_missing_slug(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get("/api/v1/projects/missing")

    # Assert
    assert response.status_code == 404


async def test_update_project_replaces_content(
    admin_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())
    updated = project_payload_factory(areas=["data"])

    # Act
    response = await admin_client.put("/api/v1/projects/demo-project", json=updated)

    # Assert
    assert response.status_code == 200
    assert response.json()["areas"] == ["data"]


async def test_delete_project_returns_204(
    admin_client: AsyncClient,
    project_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/projects", json=project_payload_factory())

    # Act
    response = await admin_client.delete("/api/v1/projects/demo-project")

    # Assert
    assert response.status_code == 204
