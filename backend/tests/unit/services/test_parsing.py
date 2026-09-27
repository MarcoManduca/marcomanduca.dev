"""Unit tests for tolerant parsing of stored items."""

import logging

import pytest
from pydantic import BaseModel

from src.services.parsing import parse_item, parse_items


class _Note(BaseModel):
    slug: str
    words: int


def test_parse_items_keeps_valid_items_in_order_and_skips_the_rest() -> None:
    # Arrange
    items = [
        {"slug": "a", "words": 1},
        {"slug": "legacy", "words": "many"},
        {"slug": "b", "words": 2},
    ]

    # Act
    notes = parse_items(_Note, items, key="slug", event="note_invalid_shape")

    # Assert
    assert [note.slug for note in notes] == ["a", "b"]


def test_parse_item_logs_the_key_of_an_item_that_does_not_fit(
    caplog: pytest.LogCaptureFixture,
) -> None:
    # Act
    with caplog.at_level(logging.WARNING, logger="src.services.parsing"):
        note = parse_item(_Note, {"slug": "legacy"}, key="slug", event="note_bad")

    # Assert
    assert note is None
    assert caplog.records[0].message == "note_bad"
    assert caplog.records[0].slug == "legacy"
