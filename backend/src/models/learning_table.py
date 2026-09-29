"""Access layer for the Learning table (pk: ``slug``, sk: ``version``).

Every article update writes a new item with an incremented ``version``
sort key; the latest version is resolved by querying with
``ScanIndexForward=False``.

Writes that depend on another version run as transactions, so an update
racing a delete can never bring a deleted article back: appending version
N+1 requires version N to still exist, and deleting the newest version
requires that no newer one appeared meanwhile.
"""

from typing import Any

from boto3.dynamodb.conditions import Key

from src.config import get_settings
from src.models.base import (
    get_dynamodb_resource,
    put_if_absent,
    query_all,
    scan_all,
    to_dynamodb,
    to_native,
    transact_write,
)


class LearningTable:
    """Thin wrapper around the DynamoDB Learning table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.learning_table_name)

    def put_version_if_absent(self, item: dict[str, Any]) -> bool:
        """Write a version only if the (slug, version) pair is free.

        Two writers that compute the same ``version`` cannot both succeed,
        preventing lost updates. Used for the first version of an article;
        later versions go through :meth:`append_version`.

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

    def append_version(self, item: dict[str, Any], previous: int) -> bool:
        """Write ``item`` as the version that follows ``previous``, atomically.

        One transaction checks that ``previous`` still exists and that the
        new (slug, version) pair is free, then writes the item.

        Parameters
        ----------
        item : dict[str, Any]
            Full article item; its ``version`` must be ``previous + 1``.
        previous : int
            Version the caller read as the latest one.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when ``previous`` was deleted or
            another writer claimed the version first.
        """
        previous_key = {"slug": item["slug"], "version": previous}
        return transact_write(
            self._table,
            [
                {
                    "ConditionCheck": {
                        "TableName": self._table.name,
                        "Key": previous_key,
                        "ConditionExpression": "attribute_exists(slug)",
                    }
                },
                {
                    "Put": {
                        "TableName": self._table.name,
                        "Item": to_dynamodb(item),
                        "ConditionExpression": "attribute_not_exists(slug)",
                    }
                },
            ],
        )

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

    def delete_all_versions(self, slug: str) -> int | None:
        """Delete every version of an article, the newest one last.

        Older versions go first in a batch, so the article stays at its
        latest version until the end (an older published version is never
        exposed). The newest one is then deleted in a transaction that
        also checks that no newer version was appended meanwhile.

        Parameters
        ----------
        slug : str
            Article partition key.

        Returns
        -------
        int or None
            Number of deleted version items (``0`` when the slug is
            unknown), or ``None`` when a concurrent update appended a new
            version: the caller retries.
        """
        # Only the sort key is needed: avoid reading full markdown bodies.
        versions = query_all(
            self._table,
            KeyConditionExpression=Key("slug").eq(slug),
            ProjectionExpression="#version",
            ExpressionAttributeNames={"#version": "version"},
            ConsistentRead=True,
        )
        if not versions:
            return 0
        numbers = sorted(item["version"] for item in versions)
        *older, newest = numbers
        with self._table.batch_writer() as batch:
            for version in older:
                batch.delete_item(Key={"slug": slug, "version": version})
        deleted_newest = transact_write(
            self._table,
            [
                {
                    "Delete": {
                        "TableName": self._table.name,
                        "Key": {"slug": slug, "version": newest},
                        "ConditionExpression": "attribute_exists(slug)",
                    }
                },
                {
                    "ConditionCheck": {
                        "TableName": self._table.name,
                        "Key": {"slug": slug, "version": newest + 1},
                        "ConditionExpression": "attribute_not_exists(slug)",
                    }
                },
            ],
        )
        return len(numbers) if deleted_newest else None

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every version item in the table, following pagination.

        Returns
        -------
        list[dict[str, Any]]
            All items in the table.
        """
        return scan_all(self._table)
