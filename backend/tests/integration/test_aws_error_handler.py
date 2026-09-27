"""Integration tests for the botocore ClientError safety-net handler."""

import pytest
from botocore.exceptions import ClientError
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from src.services.project_service import get_project_service

pytestmark = pytest.mark.integration


class _FailingProjectService:
    """Project service stub whose listing raises a given ClientError."""

    def __init__(self, code: str) -> None:
        self._error = ClientError(
            {"Error": {"Code": code, "Message": "Item size has exceeded the limit"}},
            "PutItem",
        )

    def list_projects(self, **kwargs: object) -> list[dict[str, object]]:
        raise self._error


@pytest.mark.parametrize(
    "code, expected_status",
    [
        ("ValidationException", 422),
        ("ProvisionedThroughputExceededException", 503),
        ("ThrottlingException", 503),
        ("InternalServerError", 500),
    ],
)
async def test_client_error_is_mapped_without_leaking_details(
    app: FastAPI, code: str, expected_status: int
) -> None:
    # Arrange
    app.dependency_overrides[get_project_service] = lambda: _FailingProjectService(code)
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/projects")

    # Assert
    assert response.status_code == expected_status
    assert "exceeded" not in response.text


async def test_throttling_error_asks_the_client_to_retry(app: FastAPI) -> None:
    # Arrange
    app.dependency_overrides[get_project_service] = lambda: _FailingProjectService(
        "ThrottlingException"
    )
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/projects")

    # Assert
    assert response.headers["Retry-After"] == "1"
