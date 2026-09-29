"""Unit tests for LearningTable queries (the boto3 table is mocked)."""

from decimal import Decimal
from unittest.mock import MagicMock

import pytest
from botocore.exceptions import ClientError

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

    # Assert: older versions in the batch, the newest one last.
    assert deleted == 3
    batch_versions = [c.kwargs["Key"]["version"] for c in batch.delete_item.mock_calls]
    assert batch_versions == [1, 2]


def test_delete_all_versions_deletes_the_newest_only_if_nothing_newer(
    paged_table: LearningTable,
) -> None:
    # Arrange
    client = paged_table._table.meta.client

    # Act
    paged_table.delete_all_versions("a")

    # Assert
    delete, check = client.transact_write_items.call_args.kwargs["TransactItems"]
    assert delete["Delete"]["Key"] == {"slug": "a", "version": 3}
    assert check["ConditionCheck"]["Key"] == {"slug": "a", "version": 4}
    assert check["ConditionCheck"]["ConditionExpression"] == (
        "attribute_not_exists(slug)"
    )


def test_delete_all_versions_reports_a_concurrent_append(
    paged_table: LearningTable,
) -> None:
    # Arrange
    cancelled = ClientError(
        {"Error": {"Code": "TransactionCanceledException", "Message": "x"}},
        "TransactWriteItems",
    )
    paged_table._table.meta.client.transact_write_items.side_effect = cancelled

    # Act
    deleted = paged_table.delete_all_versions("a")

    # Assert
    assert deleted is None


def test_delete_all_versions_raises_other_transaction_errors(
    paged_table: LearningTable,
) -> None:
    # Arrange
    failure = ClientError(
        {"Error": {"Code": "InternalServerError", "Message": "x"}},
        "TransactWriteItems",
    )
    paged_table._table.meta.client.transact_write_items.side_effect = failure

    # Act / Assert
    with pytest.raises(ClientError):
        paged_table.delete_all_versions("a")


def test_delete_all_versions_projects_only_the_version_key(
    paged_table: LearningTable,
) -> None:
    # Act
    paged_table.delete_all_versions("a")

    # Assert
    first_call = paged_table._table.query.call_args_list[0]
    assert first_call.kwargs["ProjectionExpression"] == "#version"
    assert first_call.kwargs["ExpressionAttributeNames"] == {"#version": "version"}


@pytest.fixture
def mocked_table() -> LearningTable:
    """LearningTable over a mocked boto3 table with no stored items."""
    table = LearningTable()
    table._table = MagicMock()
    table._table.query.return_value = {"Items": []}
    table._table.get_item.return_value = {}
    return table


@pytest.mark.parametrize("consistent", [True, False])
def test_get_latest_forwards_the_read_consistency(
    mocked_table: LearningTable, consistent: bool
) -> None:
    # Act
    mocked_table.get_latest("a", consistent=consistent)

    # Assert
    assert mocked_table._table.query.call_args.kwargs["ConsistentRead"] is consistent


@pytest.mark.parametrize("consistent", [True, False])
def test_get_version_forwards_the_read_consistency(
    mocked_table: LearningTable, consistent: bool
) -> None:
    # Act
    mocked_table.get_version("a", 1, consistent=consistent)

    # Assert
    call = mocked_table._table.get_item.call_args
    assert call.kwargs["ConsistentRead"] is consistent
