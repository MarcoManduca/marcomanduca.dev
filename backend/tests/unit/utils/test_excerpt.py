"""Unit tests for the markdown excerpt helper (mirrors excerpt.test.ts)."""

import pytest

from src.utils.excerpt import excerpt


@pytest.mark.parametrize(
    ("markdown", "expected"),
    [
        ("# Big-O notation", "Big-O notation"),
        (
            "A well-known, state-of-the-art tool",
            "A well-known, state-of-the-art tool",
        ),
        ("Intro ![diagram](https://cdn.example.com/a.png) text", "Intro text"),
        ("See [the docs](https://example.com/x-y) now", "See the docs now"),
        ("- first\n- second\n1. third", "first second third"),
        ("> quoted **bold** and _italic_", "quoted bold and italic"),
        ("Use `snake_case_names` in Python", "Use snake_case_names in Python"),
        ("Before\n\n---\n\nAfter", "Before After"),
        ("```python\nprint(1)\n```", "print(1)"),
        ("~~old~~ new", "old new"),
        ("Windows\r\nline endings", "Windows line endings"),
        ("città_bella e _perché_", "città_bella e perché"),
    ],
)
def test_excerpt_converts_markdown_to_plain_text(markdown: str, expected: str) -> None:
    # Act / Assert
    assert excerpt(markdown) == expected


def test_excerpt_truncates_long_text_with_an_ellipsis() -> None:
    # Act / Assert
    assert excerpt("word " * 10, 12) == "word word wo…"


def test_excerpt_returns_short_text_untouched() -> None:
    # Act / Assert
    assert excerpt("short", 12) == "short"


def test_excerpt_defaults_to_160_characters() -> None:
    # Act
    result = excerpt("x" * 200)

    # Assert
    assert result == "x" * 160 + "…"
