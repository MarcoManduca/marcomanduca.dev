"""Unit tests for the slugify helper."""

import pytest

from src.utils.slugify import slugify


@pytest.mark.parametrize(
    "text, expected",
    [
        ("Hello World", "hello-world"),
        ("Café au Lait!", "cafe-au-lait"),
        ("  surrounded by spaces  ", "surrounded-by-spaces"),
        ("MiXeD_Case 123", "mixed-case-123"),
        ("perché---no", "perche-no"),
        ("!!!", ""),
        ("C", "c"),
        ("C++", "cplusplus"),
        ("C#", "csharp"),
        ("F#", "fsharp"),
        ("Notepad++", "notepadplusplus"),
        ("C++ and C# Basics", "cplusplus-and-csharp-basics"),
        ("A + B", "a-b"),
        ("Tip #1", "tip-1"),
    ],
)
def test_slugify_normalizes_text(text: str, expected: str) -> None:
    # Act
    result = slugify(text)

    # Assert
    assert result == expected


def test_slugify_returns_empty_string_on_empty_input() -> None:
    # Act
    result = slugify("")

    # Assert
    assert result == ""
