"""Unit tests for the text sanitisation helpers."""

import pytest

from src.utils.sanitize import strip_control_chars, truncate


@pytest.mark.parametrize(
    "text, expected",
    [
        ("Alice", "Alice"),
        ("Ali\r\nce", "Alice"),
        ("\tBob\x00\x1b", "Bob"),
        ("Zoë​ Smith", "Zoë Smith"),
        ("\r\n", ""),
    ],
)
def test_strip_control_chars_removes_control_characters(
    text: str, expected: str
) -> None:
    # Act
    result = strip_control_chars(text)

    # Assert
    assert result == expected


@pytest.mark.parametrize(
    "text, max_length, expected",
    [
        ("short", 10, "short"),
        ("exactly10!", 10, "exactly10!"),
        ("this is too long", 8, "this is…"),
    ],
)
def test_truncate_caps_length_with_ellipsis(
    text: str, max_length: int, expected: str
) -> None:
    # Act
    result = truncate(text, max_length)

    # Assert
    assert result == expected
