"""Access layer for the CV table (pk: ``section``)."""

from typing import Any

from src.config import get_settings
from src.models.base import get_dynamodb_resource, to_dynamodb, to_native


class CvTable:
    """Thin wrapper around the DynamoDB CV table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.cv_table_name)

    def put(self, item: dict[str, Any]) -> None:
        """Write (or overwrite) a CV section item.

        Floats inside the structured content are converted to
        ``Decimal`` as required by DynamoDB.

        Parameters
        ----------
        item : dict[str, Any]
            Full section item including the ``section`` key.
        """
        self._table.put_item(Item=to_dynamodb(item))

    def get(self, section: str) -> dict[str, Any] | None:
        """Fetch a CV section by id.

        Parameters
        ----------
        section : str
            Section primary key (for example ``"experience"``).

        Returns
        -------
        dict[str, Any] or None
            The item, or ``None`` when it does not exist.
        """
        response = self._table.get_item(Key={"section": section})
        item = response.get("Item")
        return to_native(item) if item else None

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every CV section item, following pagination.

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
