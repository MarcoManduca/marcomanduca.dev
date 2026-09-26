"""Access layer for the Projects table (pk: ``slug``)."""

from typing import Any

from src.config import get_settings
from src.models.base import (
    delete_if_present,
    get_dynamodb_resource,
    put_if_absent,
    put_if_present,
    scan_all,
    to_native,
)


class ProjectsTable:
    """Thin wrapper around the DynamoDB Projects table."""

    def __init__(self) -> None:
        settings = get_settings()
        self._table = get_dynamodb_resource().Table(settings.projects_table_name)

    def replace_if_exists(self, item: dict[str, Any]) -> bool:
        """Overwrite a project only when its slug already exists.

        The condition closes the race where a project deleted between
        the service read and this write would be silently re-created.

        Parameters
        ----------
        item : dict[str, Any]
            Full project item including the ``slug`` key.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the project is missing.
        """
        return put_if_present(self._table, item, "slug")

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
        return put_if_absent(self._table, item, "slug")

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

    def delete_if_exists(self, slug: str) -> bool:
        """Delete a project by slug, only when it exists.

        Parameters
        ----------
        slug : str
            Project primary key.

        Returns
        -------
        bool
            ``True`` on success, ``False`` when the project is missing.
        """
        return delete_if_present(self._table, {"slug": slug}, "slug")

    def scan_all(self) -> list[dict[str, Any]]:
        """Return every project item, following pagination.

        Returns
        -------
        list[dict[str, Any]]
            All items in the table.
        """
        return scan_all(self._table)
