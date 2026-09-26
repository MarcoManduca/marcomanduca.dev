"""Unit tests for LearningTable pagination (the boto3 table is mocked)."""

from decimal import Decimal
from unittest.mock import MagicMock

import pytest

from src.models.learning_table import LearningTable

_PAGE_ONE = {
    "Items": [{"slug": "a", "version": Decimal(3)}],
    "LastEvaluatedKey": {"slug": "a", "version": Decimal(3)},
}
_PAGE_TWO = {
    "Items": [{"slug": "a", "version": Decimal(2)}],
    "LastEvaluatedKey": {"slug": "a", "version": Decimal(2)},
}
_PAGE_THREE = {"Items": [{"slug": "a", "version": Decimal(1)}]}


@pytest.fixture
def paged_table() -> LearningTable:
    """LearningTable whose query returns three pages of versions."""
    table = LearningTable()
    table._table = MagicMock()
    table._table.query.side_effect = [_PAGE_ONE, _PAGE_TWO, _PAGE_THREE]
    return table


def test_list_versions_follows_every_page(paged_table: LearningTable) -> None:
    # Act
    versions = paged_table.list_versions("a")

    # Assert
    assert [item["version"] for item in versions] == [3, 2, 1]
    assert paged_table._table.query.call_count == 3


def test_list_versions_passes_last_evaluated_key_as_start_key(
    paged_table: LearningTable,
) -> None:
    # Act
    paged_table.list_versions("a")

    # Assert
    last_call = paged_table._table.query.call_args_list[-1]
    assert last_call.kwargs["ExclusiveStartKey"] == _PAGE_TWO["LastEvaluatedKey"]


def test_delete_all_versions_deletes_items_from_every_page(
    paged_table: LearningTable,
) -> None:
    # Arrange
    batch = paged_table._table.batch_writer.return_value.__enter__.return_value

    # Act
    deleted = paged_table.delete_all_versions("a")

    # Assert
    assert deleted == 3
    assert batch.delete_item.call_count == 3


def test_delete_all_versions_projects_only_the_version_key(
    paged_table: LearningTable,
) -> None:
    # Act
    paged_table.delete_all_versions("a")

    # Assert
    first_call = paged_table._table.query.call_args_list[0]
    assert first_call.kwargs["ProjectionExpression"] == "#version"
    assert first_call.kwargs["ExpressionAttributeNames"] == {"#version": "version"}
