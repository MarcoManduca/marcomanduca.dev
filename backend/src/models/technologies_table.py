"""Access layer for the Technologies table (pk: ``id``)."""

from typing import Any

from botocore.exceptions import ClientError

from src.config import get_settings
from src.models.base import get_dynamodb_resource, to_native


class TechnologiesTable:
    """Thin wrapper around the DynamoDB Technologies table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.technologies_table_name)

    def put_if_absent(self, item: dict[str, Any]) -> bool:
        """Write a technology only when its id is not taken.

        Parameters
        ----------
        item : dict[str, Any]
            Full technology item including the ``id`` key.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the id already exists.
        """
        try:
            self._table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(id)",
            )
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return False
            raise
        return True

    def get(self, tech_id: str) -> dict[str, Any] | None:
        """Fetch a technology by id.

        Parameters
        ----------
        tech_id : str
            Technology primary key.

        Returns
        -------
        dict[str, Any] or None
            The item, or ``None`` when it does not exist.
        """
        response = self._table.get_item(Key={"id": tech_id})
        item = response.get("Item")
        return to_native(item) if item else None

    def delete(self, tech_id: str) -> None:
        """Delete a technology by id.

        Parameters
        ----------
        tech_id : str
            Technology primary key.
        """
        self._table.delete_item(Key={"id": tech_id})

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every technology item, following pagination.

        Returns
        -------
        list[dict[str, Any]]
            All items in the table.
        """
        items: list[dict[str, Any]] = []
        kwargs: dict[str, Any] = {}
        while True:
            response = self._table.scan(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
        return [to_native(item) for item in items]
