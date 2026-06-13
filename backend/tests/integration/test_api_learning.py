"""Integration tests for the learning API, including versioning."""

from collections.abc import Callable
from typing import Any

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_create_article_returns_201_with_version_one(
    admin_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    response = await admin_client.post(
        "/api/v1/learning", json=article_payload_factory()
    )

    # Assert
    assert response.status_code == 201
    assert response.json()["version"] == 1


async def test_create_article_returns_401_without_token(
    public_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Act
    response = await public_client.post(
        "/api/v1/learning", json=article_payload_factory()
    )

    # Assert
    assert response.status_code == 401


async def test_update_article_creates_new_version(
    admin_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())
    updated = article_payload_factory(tags=["updated"])

    # Act
    response = await admin_client.put("/api/v1/learning/demo-article", json=updated)

    # Assert
    assert response.status_code == 200
    assert response.json()["version"] == 2


async def test_get_article_returns_latest_version(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())
    await admin_client.put(
        "/api/v1/learning/demo-article",
        json=article_payload_factory(tags=["v2"]),
    )

    # Act
    response = await public_client.get("/api/v1/learning/demo-article")

    # Assert
    assert response.status_code == 200
    assert response.json()["version"] == 2
    assert response.json()["tags"] == ["v2"]


async def test_list_versions_returns_history_for_admin(
    admin_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())
    await admin_client.put(
        "/api/v1/learning/demo-article", json=article_payload_factory()
    )

    # Act
    response = await admin_client.get("/api/v1/learning/demo-article/versions")

    # Assert
    assert response.status_code == 200
    assert [item["version"] for item in response.json()] == [2, 1]


async def test_list_versions_returns_401_without_token(
    public_client: AsyncClient,
) -> None:
    # Act
    response = await public_client.get("/api/v1/learning/demo-article/versions")

    # Assert
    assert response.status_code == 401


async def test_rollback_restores_old_version_as_new_latest(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post(
        "/api/v1/learning", json=article_payload_factory(tags=["original"])
    )
    await admin_client.put(
        "/api/v1/learning/demo-article",
        json=article_payload_factory(tags=["changed"]),
    )

    # Act
    response = await admin_client.post(
        "/api/v1/learning/demo-article/rollback", json={"version": 1}
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["version"] == 3
    assert response.json()["tags"] == ["original"]


async def test_rollback_returns_404_for_missing_version(
    admin_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())

    # Act
    response = await admin_client.post(
        "/api/v1/learning/demo-article/rollback", json={"version": 42}
    )

    # Assert
    assert response.status_code == 404


async def test_list_articles_excludes_drafts_for_public_callers(
    admin_client: AsyncClient,
    public_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())
    draft = article_payload_factory(
        title={"it": "Bozza", "en": "Draft Note"}, status="draft"
    )
    await admin_client.post("/api/v1/learning", json=draft)

    # Act
    response = await public_client.get("/api/v1/learning")

    # Assert
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["demo-article"]


async def test_delete_article_returns_204(
    admin_client: AsyncClient,
    article_payload_factory: Callable[..., dict[str, Any]],
) -> None:
    # Arrange
    await admin_client.post("/api/v1/learning", json=article_payload_factory())

    # Act
    response = await admin_client.delete("/api/v1/learning/demo-article")

    # Assert
    assert response.status_code == 204
