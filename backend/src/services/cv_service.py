"""Business logic for the dynamic CV."""

from typing import Any

from src.models.cv_table import CvTable
from src.schemas.common import Language
from src.schemas.cv import CvSectionId, CvSectionUpdate


class CvService:
    """Read and update structured CV sections.

    Parameters
    ----------
    table : CvTable
        DynamoDB access layer for CV sections.
    """

    def __init__(self, table: CvTable) -> None:
        self._table = table

    def get_sections(self) -> dict[str, Any]:
        """Return every stored section with bilingual content.

        Returns
        -------
        dict[str, Any]
            Mapping of section id to ``{"it": ..., "en": ...}`` content.
        """
        return {item["section"]: item["content"] for item in self._table.scan_all()}

    def get_cv(self, lang: Language) -> dict[str, Any]:
        """Return the CV localized to one language.

        Parameters
        ----------
        lang : Language
            Requested language.

        Returns
        -------
        dict[str, Any]
            Mapping of section id to content in the requested language.
        """
        return {
            section: content.get(lang.value)
            for section, content in self.get_sections().items()
        }

    def upsert_section(
        self, section_id: CvSectionId, payload: CvSectionUpdate
    ) -> dict[str, Any]:
        """Create or replace a CV section.

        Parameters
        ----------
        section_id : CvSectionId
            Section to write.
        payload : CvSectionUpdate
            New bilingual content.

        Returns
        -------
        dict[str, Any]
            The stored section item.
        """
        item = {
            "section": section_id.value,
            "content": payload.content.model_dump(mode="json"),
        }
        self._table.put(item)
        return item


def get_cv_service() -> CvService:
    """Build a request-scoped :class:`CvService`.

    Returns
    -------
    CvService
        Service bound to a fresh table wrapper.
    """
    return CvService(CvTable())
