"""Access layer for the Technologies table (pk: ``id``)."""

from typing import Any

from src.config import get_settings
from src.models.base import (
    delete_if_present,
    get_dynamodb_resource,
    put_if_absent,
    scan_all,
)


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
        return put_if_absent(self._table, item, "id")

    def delete_if_exists(self, tech_id: str) -> bool:
        """Delete a technology by id in one conditional write.

        Parameters
        ----------
        tech_id : str
            Technology primary key.

        Returns
        -------
        bool
            ``True`` when it was deleted, ``False`` when it did not exist.
        """
        return delete_if_present(self._table, {"id": tech_id}, "id")

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every technology item, following pagination.

        Returns
        -------
        list[dict[str, Any]]
            All items in the table.
        """
        return scan_all(self._table)
