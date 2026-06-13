"""Access layer for the Projects table (pk: ``slug``)."""

from typing import Any

from botocore.exceptions import ClientError

from src.config import get_settings
from src.models.base import get_dynamodb_resource, to_native


class ProjectsTable:
    """Thin wrapper around the DynamoDB Projects table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.projects_table_name)

    def put(self, item: dict[str, Any]) -> None:
        """Write (or overwrite) a project item.

        Parameters
        ----------
        item : dict[str, Any]
            Full project item including the ``slug`` key.
        """
        self._table.put_item(Item=item)

    def put_if_absent(self, item: dict[str, Any]) -> bool:
        """Write a project only when its slug is not taken.

        Parameters
        ----------
        item : dict[str, Any]
            Full project item including the ``slug`` key.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the slug already exists.
        """
        try:
            self._table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(slug)",
            )
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return False
            raise
        return True

    def get(self, slug: str) -> dict[str, Any] | None:
        """Fetch a project by slug.

        Parameters
        ----------
        slug : str
            Project primary key.

        Returns
        -------
        dict[str, Any] or None
            The item, or ``None`` when it does not exist.
        """
        response = self._table.get_item(Key={"slug": slug})
        item = response.get("Item")
        return to_native(item) if item else None

    def delete(self, slug: str) -> None:
        """Delete a project by slug.

        Parameters
        ----------
        slug : str
            Project primary key.
        """
        self._table.delete_item(Key={"slug": slug})

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every project item, following pagination.

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
