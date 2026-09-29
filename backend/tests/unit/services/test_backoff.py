"""Unit tests for the jittered retry backoff."""

import pytest

from src.services.backoff import backoff_delay


@pytest.mark.parametrize(
    ("attempt", "bound"),
    [(0, 0.05), (1, 0.1), (2, 0.2), (3, 0.4), (10, 0.4)],
)
def test_backoff_delay_stays_within_the_capped_bound(
    attempt: int, bound: float
) -> None:
    # Act
    delay = backoff_delay(attempt)

    # Assert
    assert 0 <= delay <= bound
