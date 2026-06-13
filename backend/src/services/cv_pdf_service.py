"""PDF rendering of the CV using reportlab (pure Python)."""

from io import BytesIO
from typing import Any
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import StyleSheet1, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from src.schemas.common import Language

_PDF_TITLE = "Marco Manduca - Curriculum Vitae"


def build_cv_pdf(sections: dict[str, Any], lang: Language) -> bytes:
    """Render localized CV sections into a PDF document.

    Parameters
    ----------
    sections : dict[str, Any]
        Mapping of section id to localized content (string, list or
        object), as produced by ``CvService.get_cv``.
    lang : Language
        Language of the content, shown in the document subtitle.

    Returns
    -------
    bytes
        The PDF file content.
    """
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, title=_PDF_TITLE)
    styles = getSampleStyleSheet()
    story: list[Any] = [
        Paragraph(_PDF_TITLE, styles["Title"]),
        Paragraph(f"Language: {lang.value.upper()}", styles["Italic"]),
        Spacer(1, 12),
    ]
    for section_id, content in sections.items():
        story.append(Paragraph(escape(section_id.title()), styles["Heading1"]))
        story.extend(_render_content(content, styles))
        story.append(Spacer(1, 8))
    document.build(story)
    return buffer.getvalue()


def _render_content(content: Any, styles: StyleSheet1) -> list[Any]:
    """Render arbitrary JSON-like content as flowable paragraphs."""
    if content is None:
        return []
    if isinstance(content, str):
        return [Paragraph(escape(content), styles["BodyText"])]
    if isinstance(content, list):
        flowables: list[Any] = []
        for entry in content:
            flowables.extend(_render_content(entry, styles))
        return flowables
    if isinstance(content, dict):
        return [
            Paragraph(
                f"<b>{escape(str(key))}:</b> {escape(str(value))}",
                styles["BodyText"],
            )
            for key, value in content.items()
        ]
    return [Paragraph(escape(str(content)), styles["BodyText"])]
