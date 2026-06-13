"""Business logic for the technologies catalogue."""

from typing import Any

from src.models.technologies_table import TechnologiesTable
from src.schemas.technology import TechnologyCreate
from src.services.errors import ConflictError, NotFoundError
from src.utils.slugify import slugify


class TechnologyService:
    """CRUD for technologies.

    Parameters
    ----------
    table : TechnologiesTable
        DynamoDB access layer for technologies.
    """

    def __init__(self, table: TechnologiesTable) -> None:
        self._table = table

    def list_technologies(self) -> list[dict[str, Any]]:
        """Return all technologies sorted by name.

        Returns
        -------
        list[dict[str, Any]]
            Every technology item.
        """
        items = self._table.scan_all()
        return sorted(items, key=lambda item: item["name"].lower())

    def create_technology(self, payload: TechnologyCreate) -> dict[str, Any]:
        """Register a technology; the id derives from the name.

        Parameters
        ----------
        payload : TechnologyCreate
            Validated technology content.

        Returns
        -------
        dict[str, Any]
            The stored technology item.

        Raises
        ------
        ConflictError
            When the derived id already exists.
        """
        tech_id = slugify(payload.name)
        item = payload.model_dump(mode="json") | {"id": tech_id}
        if not self._table.put_if_absent(item):
            raise ConflictError(f"Technology '{tech_id}' already exists.")
        return item

    def delete_technology(self, tech_id: str) -> None:
        """Delete a technology by id.

        Parameters
        ----------
        tech_id : str
            Technology primary key.

        Raises
        ------
        NotFoundError
            When the technology does not exist.
        """
        if self._table.get(tech_id) is None:
            raise NotFoundError(f"Technology '{tech_id}' not found.")
        self._table.delete(tech_id)


def get_technology_service() -> TechnologyService:
    """Build a request-scoped :class:`TechnologyService`.

    Returns
    -------
    TechnologyService
        Service bound to a fresh table wrapper.
    """
    return TechnologyService(TechnologiesTable())
