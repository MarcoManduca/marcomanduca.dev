"""Shared DynamoDB helpers (resource factory, type conversion)."""

from decimal import Decimal
from typing import Any

import boto3
from botocore.exceptions import ClientError

from src.config import get_settings


def get_dynamodb_resource() -> Any:
    """Build a boto3 DynamoDB resource from the current settings.

    ``DYNAMODB_ENDPOINT_URL`` (when set) points the resource at a local
    DynamoDB instance for development and manual testing.

    Returns
    -------
    Any
        A ``boto3.resources.factory.dynamodb.ServiceResource``.
    """
    settings = get_settings()
    kwargs: dict[str, Any] = {"region_name": settings.aws_region}
    if settings.dynamodb_endpoint_url:
        kwargs["endpoint_url"] = settings.dynamodb_endpoint_url
    return boto3.resource("dynamodb", **kwargs)


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


def scan_all(table: Any) -> list[dict[str, Any]]:
    """Return every item in a table, following pagination.

    Parameters
    ----------
    table : Any
        A boto3 DynamoDB ``Table`` resource.

    Returns
    -------
    list[dict[str, Any]]
        All items, with numeric types converted to native Python.
    """
    items: list[dict[str, Any]] = []
    kwargs: dict[str, Any] = {}
    while True:
        response = table.scan(**kwargs)
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
    try:
        table.put_item(
            Item=item,
            ConditionExpression=f"attribute_not_exists({key_name})",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False
        raise
    return True
