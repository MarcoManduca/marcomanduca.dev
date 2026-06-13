"""Access layer for the Learning table (pk: ``slug``, sk: ``version``).

Every article update writes a new item with an incremented ``version``
sort key; the latest version is resolved by querying with
``ScanIndexForward=False``.
"""

from typing import Any

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from src.config import get_settings
from src.models.base import get_dynamodb_resource, to_native


class LearningTable:
    """Thin wrapper around the DynamoDB Learning table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.learning_table_name)

    def put_version(self, item: dict[str, Any]) -> None:
        """Write an article version item.

        Parameters
        ----------
        item : dict[str, Any]
            Full article item with ``slug`` and ``version`` keys.
        """
        self._table.put_item(Item=item)

    def put_version_if_absent(self, item: dict[str, Any]) -> bool:
        """Write a version only if the (slug, version) pair is free.

        Parameters
        ----------
        item : dict[str, Any]
            Full article item with ``slug`` and ``version`` keys.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the item already exists.
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

    def get_latest(self, slug: str) -> dict[str, Any] | None:
        """Fetch the highest-version item for a slug.

        Parameters
        ----------
        slug : str
            Article partition key.

        Returns
        -------
        dict[str, Any] or None
            Latest version item, or ``None`` when the slug is unknown.
        """
        response = self._table.query(
            KeyConditionExpression=Key("slug").eq(slug),
            ScanIndexForward=False,
            Limit=1,
        )
        items = response.get("Items", [])
        return to_native(items[0]) if items else None

    def get_version(self, slug: str, version: int) -> dict[str, Any] | None:
        """Fetch a specific article version.

        Parameters
        ----------
        slug : str
            Article partition key.
        version : int
            Version sort key.

        Returns
        -------
        dict[str, Any] or None
            The version item, or ``None`` when it does not exist.
        """
        response = self._table.get_item(Key={"slug": slug, "version": version})
        item = response.get("Item")
        return to_native(item) if item else None

    def list_versions(self, slug: str) -> list[dict[str, Any]]:
        """Return all versions for a slug, newest first.

        Parameters
        ----------
        slug : str
            Article partition key.

        Returns
        -------
        list[dict[str, Any]]
            Version items in descending version order.
        """
        response = self._table.query(
            KeyConditionExpression=Key("slug").eq(slug),
            ScanIndexForward=False,
        )
        return [to_native(item) for item in response.get("Items", [])]

    def delete_all_versions(self, slug: str) -> int:
        """Delete every version of an article.

        Parameters
        ----------
        slug : str
            Article partition key.

        Returns
        -------
        int
            Number of deleted version items.
        """
        versions = self.list_versions(slug)
        with self._table.batch_writer() as batch:
            for item in versions:
                batch.delete_item(Key={"slug": slug, "version": item["version"]})
        return len(versions)

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every version item in the table, following pagination.

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
