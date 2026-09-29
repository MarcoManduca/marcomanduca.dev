"""Integration tests for the botocore error safety-net handlers."""

import logging

import pytest
from botocore.exceptions import (
    BotoCoreError,
    ClientError,
    EndpointConnectionError,
    ReadTimeoutError,
)
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


class _UnreachableProjectService:
    """Project service stub whose listing raises a given BotoCoreError."""

    def __init__(self, error: BotoCoreError) -> None:
        self._error = error

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


@pytest.mark.parametrize(
    "error",
    [
        ReadTimeoutError(endpoint_url="https://dynamodb.eu-west-1.amazonaws.com"),
        EndpointConnectionError(
            endpoint_url="https://dynamodb.eu-west-1.amazonaws.com"
        ),
    ],
)
async def test_connection_error_is_a_retryable_503(
    app: FastAPI, error: BotoCoreError
) -> None:
    # Arrange
    app.dependency_overrides[get_project_service] = lambda: _UnreachableProjectService(
        error
    )
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/projects")

    # Assert
    assert response.status_code == 503
    assert response.headers["Retry-After"] == "1"
    assert "amazonaws" not in response.text


async def test_client_error_log_names_the_operation(
    app: FastAPI, caplog: pytest.LogCaptureFixture
) -> None:
    # Arrange
    app.dependency_overrides[get_project_service] = lambda: _FailingProjectService(
        "InternalServerError"
    )
    transport = ASGITransport(app=app)

    # Act
    with caplog.at_level(logging.ERROR, logger="src.main"):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            await client.get("/api/v1/projects")

    # Assert
    record = next(r for r in caplog.records if r.getMessage() == "aws_client_error")
    assert record.operation == "PutItem"
