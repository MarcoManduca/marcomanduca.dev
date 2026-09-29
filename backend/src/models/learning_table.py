"""Access layer for the Learning table (pk: ``slug``, sk: ``version``).

Every article update writes a new item with an incremented ``version``
sort key; the latest version is resolved by querying with
``ScanIndexForward=False``.
"""

from typing import Any

from boto3.dynamodb.conditions import Key

from src.config import get_settings
from src.models.base import (
    get_dynamodb_resource,
    put_if_absent,
    query_all,
    scan_all,
    to_native,
)


class LearningTable:
    """Thin wrapper around the DynamoDB Learning table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.learning_table_name)

    def put_version_if_absent(self, item: dict[str, Any]) -> bool:
        """Write a version only if the (slug, version) pair is free.

        The conditional write is the concurrency guard for both the
        first version and every subsequent one: two writers that compute
        the same next ``version`` cannot both succeed, preventing lost
        updates.

        Parameters
        ----------
        item : dict[str, Any]
            Full article item with ``slug`` and ``version`` keys.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the item already exists.
        """
        return put_if_absent(self._table, item, "slug")

    def get_latest(
        self, slug: str, *, consistent: bool = False
    ) -> dict[str, Any] | None:
        """Fetch the highest-version item for a slug.

        Parameters
        ----------
        slug : str
            Article partition key.
        consistent : bool
            Strongly consistent read, for read-modify-write paths: an
            eventually consistent read can miss a version written a moment
            ago and make the next write collide with it.

        Returns
        -------
        dict[str, Any] or None
            Latest version item, or ``None`` when the slug is unknown.
        """
        response = self._table.query(
            KeyConditionExpression=Key("slug").eq(slug),
            ScanIndexForward=False,
            Limit=1,
            ConsistentRead=consistent,
        )
        items = response.get("Items", [])
        return to_native(items[0]) if items else None

    def get_version(
        self, slug: str, version: int, *, consistent: bool = False
    ) -> dict[str, Any] | None:
        """Fetch a specific article version.

        Parameters
        ----------
        slug : str
            Article partition key.
        version : int
            Version sort key.
        consistent : bool
            Strongly consistent read (see :meth:`get_latest`).

        Returns
        -------
        dict[str, Any] or None
            The version item, or ``None`` when it does not exist.
        """
        response = self._table.get_item(
            Key={"slug": slug, "version": version}, ConsistentRead=consistent
        )
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
        return query_all(
            self._table,
            KeyConditionExpression=Key("slug").eq(slug),
            ScanIndexForward=False,
        )

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
        # Only the sort key is needed: avoid reading full markdown bodies.
        versions = query_all(
            self._table,
            KeyConditionExpression=Key("slug").eq(slug),
            ProjectionExpression="#version",
            ExpressionAttributeNames={"#version": "version"},
        )
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
        return scan_all(self._table)
