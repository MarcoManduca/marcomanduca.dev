"""Unit tests for the sliding-window rate limiter."""

from src.utils.rate_limit import SlidingWindowRateLimiter


def test_is_allowed_accepts_requests_under_the_limit() -> None:
    # Arrange
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=60)

    # Act
    first = limiter.is_allowed("1.2.3.4", now=0.0)
    second = limiter.is_allowed("1.2.3.4", now=1.0)

    # Assert
    assert first is True
    assert second is True


def test_is_allowed_blocks_requests_over_the_limit() -> None:
    # Arrange
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=60)
    limiter.is_allowed("1.2.3.4", now=0.0)
    limiter.is_allowed("1.2.3.4", now=1.0)

    # Act
    third = limiter.is_allowed("1.2.3.4", now=2.0)

    # Assert
    assert third is False


def test_is_allowed_accepts_again_after_window_expiry() -> None:
    # Arrange
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=60)
    limiter.is_allowed("1.2.3.4", now=0.0)

    # Act
    after_window = limiter.is_allowed("1.2.3.4", now=61.0)

    # Assert
    assert after_window is True


def test_is_allowed_tracks_keys_independently() -> None:
    # Arrange
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=60)
    limiter.is_allowed("1.1.1.1", now=0.0)

    # Act
    other_key = limiter.is_allowed("2.2.2.2", now=0.0)

    # Assert
    assert other_key is True


def test_reset_clears_recorded_hits() -> None:
    # Arrange
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=60)
    limiter.is_allowed("1.2.3.4", now=0.0)

    # Act
    limiter.reset()
    after_reset = limiter.is_allowed("1.2.3.4", now=1.0)

    # Assert
    assert after_reset is True
