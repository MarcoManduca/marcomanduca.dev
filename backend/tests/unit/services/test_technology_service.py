"""Unit tests for TechnologyService."""

import pytest

from src.models.technologies_table import TechnologiesTable
from src.schemas.technology import TechnologyCreate
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.services.technology_service import TechnologyService


@pytest.fixture
def service(aws_backend: None) -> TechnologyService:
    """Technology service bound to the moto-backed table."""
    return TechnologyService(TechnologiesTable())


def test_create_technology_derives_id_from_name(
    service: TechnologyService,
) -> None:
    # Arrange
    payload = TechnologyCreate(name="FastAPI", icon="fastapi.svg", category="backend")

    # Act
    item = service.create_technology(payload)

    # Assert
    assert item["id"] == "fastapi"
    assert item["name"] == "FastAPI"


def test_create_technology_raises_conflict_on_duplicate_id(
    service: TechnologyService,
) -> None:
    # Arrange
    payload = TechnologyCreate(name="FastAPI", icon="fastapi.svg", category="backend")
    service.create_technology(payload)

    # Act / Assert
    with pytest.raises(ConflictError):
        service.create_technology(payload)


def test_create_technology_raises_invalid_input_on_empty_id(
    service: TechnologyService,
) -> None:
    # Arrange
    payload = TechnologyCreate(name="!!!", icon="x.svg", category="backend")

    # Act / Assert
    with pytest.raises(InvalidInputError):
        service.create_technology(payload)


def test_list_technologies_returns_items_sorted_by_name(
    service: TechnologyService,
) -> None:
    # Arrange
    service.create_technology(
        TechnologyCreate(name="React", icon="react.svg", category="frontend")
    )
    service.create_technology(
        TechnologyCreate(name="Boto3", icon="boto3.svg", category="backend")
    )

    # Act
    items = service.list_technologies()

    # Assert
    assert [item["name"] for item in items] == ["Boto3", "React"]


def test_delete_technology_removes_item(service: TechnologyService) -> None:
    # Arrange
    service.create_technology(
        TechnologyCreate(name="FastAPI", icon="fastapi.svg", category="backend")
    )

    # Act
    service.delete_technology("fastapi")

    # Assert
    assert service.list_technologies() == []


def test_delete_technology_raises_not_found_on_missing_id(
    service: TechnologyService,
) -> None:
    # Act / Assert
    with pytest.raises(NotFoundError):
        service.delete_technology("missing")
