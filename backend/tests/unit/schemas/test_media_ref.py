"""Unit tests for media reference validation (image sources)."""

import pytest
from pydantic import BaseModel, ValidationError

from src.schemas.common import MediaRef


class _Media(BaseModel):
    src: MediaRef


@pytest.mark.parametrize(
    "src",
    [
        "/images/projects/deep-layers/cover.webp",
        "https://cdn.example.com/cover.png",
        "http://localhost:5173/images/a.png",
    ],
)
def test_media_ref_accepts_site_paths_and_http_urls(src: str) -> None:
    # Act
    media = _Media(src=src)

    # Assert
    assert media.src == src


@pytest.mark.parametrize(
    "src",
    [
        "javascript:alert(1)",
        "data:image/svg+xml;base64,PHN2Zz4=",
        "//evil.example.com/a.png",
        "/\\evil.example.com/a.png",
        "/\t/evil.example.com/a.png",
        "/images/new\nline.png",
        "/images/with space.png",
        "images/projects/a.webp",
    ],
)
def test_media_ref_rejects_what_the_page_would_not_load(src: str) -> None:
    # Act / Assert
    with pytest.raises(ValidationError):
        _Media(src=src)
