"""Business logic for the technologies catalogue."""

from functools import lru_cache
from typing import Any

from src.models.technologies_table import TechnologiesTable
from src.schemas.technology import TechnologyCreate
from src.services.errors import ConflictError, InvalidInputError, NotFoundError
from src.utils.slugify import slugify

_EMPTY_SLUG_MESSAGE = "Name must contain at least one alphanumeric character."


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
        return sorted(items, key=lambda item: str(item.get("name", "")).lower())

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
        InvalidInputError
            When the name yields an empty id.
        """
        tech_id = slugify(payload.name)
        if not tech_id:
            raise InvalidInputError(_EMPTY_SLUG_MESSAGE)
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


@lru_cache
def get_technology_service() -> TechnologyService:
    """Return the cached :class:`TechnologyService`.

    Built once per execution environment so boto3 objects are reused
    across requests; tests clear it with ``cache_clear()``.

    Returns
    -------
    TechnologyService
        Shared service instance.
    """
    return TechnologyService(TechnologiesTable())
