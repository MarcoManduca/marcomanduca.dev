"""Shared DynamoDB helpers (resource factory, type conversion, writes)."""

from decimal import Decimal
from typing import Any

from botocore.exceptions import ClientError

from src.config import get_settings
from src.utils.aws_clients import get_resource

_CONDITION_FAILED = "ConditionalCheckFailedException"
# Raised when any condition in a transaction fails, or when a concurrent
# transaction touched the same items: both mean "re-read and retry".
_TRANSACTION_CANCELED = "TransactionCanceledException"


def get_dynamodb_resource() -> Any:
    """Return the cached boto3 DynamoDB resource for the current settings.

    ``DYNAMODB_ENDPOINT_URL`` (when set) points the resource at a local
    DynamoDB instance for development and manual testing.

    Returns
    -------
    Any
        A ``boto3.resources.factory.dynamodb.ServiceResource``.
    """
    settings = get_settings()
    return get_resource("dynamodb", settings.aws_region, settings.dynamodb_endpoint_url)


def to_native(value: Any) -> Any:
    """Recursively convert DynamoDB ``Decimal`` values to int/float.

    Parameters
    ----------
    value : Any
        Item attribute as returned by boto3.

    Returns
    -------
    Any
        The same structure with JSON-friendly numeric types.
    """
    if isinstance(value, list):
        return [to_native(entry) for entry in value]
    if isinstance(value, dict):
        return {key: to_native(entry) for key, entry in value.items()}
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    return value


def to_dynamodb(value: Any) -> Any:
    """Recursively convert floats to ``Decimal`` for DynamoDB writes.

    Parameters
    ----------
    value : Any
        JSON-like structure to store.

    Returns
    -------
    Any
        The same structure with ``Decimal`` in place of ``float``.
    """
    if isinstance(value, list):
        return [to_dynamodb(entry) for entry in value]
    if isinstance(value, dict):
        return {key: to_dynamodb(entry) for key, entry in value.items()}
    if isinstance(value, float):
        return Decimal(str(value))
    return value


def scan_all(table: Any, **kwargs: Any) -> list[dict[str, Any]]:
    """Return every item in a table, following pagination.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.
    **kwargs : Any
        Arguments forwarded to ``Table.scan`` on every page (e.g. a
        projection, see :func:`projection`).

    Returns
    -------
    list[dict[str, Any]]
        All items, with numeric types converted to native Python.
    """
    return _paginate(table.scan, **kwargs)


def projection(*attributes: str) -> dict[str, Any]:
    """Build the arguments that read only the given attributes.

    Every name goes through a placeholder, so reserved words such as
    ``status`` need no special care.

    Parameters
    ----------
    *attributes : str
        Top-level attribute names to read.

    Returns
    -------
    dict[str, Any]
        ``ProjectionExpression`` and ``ExpressionAttributeNames`` for a
        scan, query or get.
    """
    names = {f"#p{index}": name for index, name in enumerate(attributes)}
    return {
        "ProjectionExpression": ", ".join(names),
        "ExpressionAttributeNames": names,
    }


def query_all(table: Any, **kwargs: Any) -> list[dict[str, Any]]:
    """Run a query and return every matching item, following pagination.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.
    **kwargs : Any
        Arguments forwarded to ``Table.query`` on every page (key
        condition, projection, ordering, ...).

    Returns
    -------
    list[dict[str, Any]]
        All matching items, with numeric types converted to native Python.
    """
    return _paginate(table.query, **kwargs)


def _paginate(operation: Any, **kwargs: Any) -> list[dict[str, Any]]:
    """Call a scan/query operation page by page until exhausted."""
    items: list[dict[str, Any]] = []
    while True:
        response = operation(**kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        kwargs["ExclusiveStartKey"] = last_key
    return [to_native(item) for item in items]


def put_if_absent(table: Any, item: dict[str, Any], key_name: str) -> bool:
    """Write an item only when its key attribute is not already present.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.
    item : dict[str, Any]
        Full item to store.
    key_name : str
        Name of the key attribute guarded by the conditional write.

    Returns
    -------
    bool
        ``True`` on success, ``False`` when the item already exists.
    """
    return _conditional(
        table.put_item,
        Item=item,
        ConditionExpression=f"attribute_not_exists({key_name})",
    )


def put_if_present(table: Any, item: dict[str, Any], key_name: str) -> bool:
    """Overwrite an item only when its key attribute already exists.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.
    item : dict[str, Any]
        Full item to store.
    key_name : str
        Name of the key attribute guarded by the conditional write.

    Returns
    -------
    bool
        ``True`` on success, ``False`` when the item does not exist.
    """
    return _conditional(
        table.put_item,
        Item=item,
        ConditionExpression=f"attribute_exists({key_name})",
    )


def delete_if_present(table: Any, key: dict[str, Any], key_name: str) -> bool:
    """Delete an item only when it exists.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.
    key : dict[str, Any]
        Primary key of the item to delete.
    key_name : str
        Name of the key attribute guarded by the conditional delete.

    Returns
    -------
    bool
        ``True`` on success, ``False`` when the item does not exist.
    """
    return _conditional(
        table.delete_item,
        Key=key,
        ConditionExpression=f"attribute_exists({key_name})",
    )


def transact_write(table: Any, actions: list[dict[str, Any]]) -> bool:
    """Apply write actions atomically: all of them or none.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource. Its client runs the call and,
        being a resource client, serialises the plain Python keys and items
        in ``actions`` itself (floats must already be ``Decimal``, see
        :func:`to_dynamodb`).
    actions : list[dict[str, Any]]
        ``TransactItems`` entries (``Put``, ``Delete``, ``ConditionCheck``,
        ...).

    Returns
    -------
    bool
        ``True`` when committed, ``False`` when the transaction was
        cancelled (a condition failed or it conflicted with another one).
    """
    try:
        table.meta.client.transact_write_items(TransactItems=actions)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == _TRANSACTION_CANCELED:
            return False
        raise
    return True


def _conditional(operation: Any, **kwargs: Any) -> bool:
    """Run a conditional write, mapping a failed condition to ``False``."""
    try:
        operation(**kwargs)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == _CONDITION_FAILED:
            return False
        raise
    return True
