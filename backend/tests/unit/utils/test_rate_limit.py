"""Unit tests for the DynamoDB-backed rate limiter."""

from typing import Any

import boto3
import pytest
from moto import mock_aws

from src.utils.rate_limit import DynamoRateLimiter, RateLimiterUnavailableError

_REGION = "eu-west-1"
_TABLE = "test-ratelimit"


def _make_table() -> Any:
    """Create the rate-limit table in moto and return the Table resource."""
    dynamodb = boto3.resource("dynamodb", region_name=_REGION)
    dynamodb.create_table(
        TableName=_TABLE,
        KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    return dynamodb.Table(_TABLE)


@mock_aws
def test_allow_key_accepts_requests_under_the_limit() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=2, window_seconds=60, daily_max=100
    )

    # Act
    first = limiter.allow_key("1.2.3.4", now=0.0)
    second = limiter.allow_key("1.2.3.4", now=1.0)

    # Assert
    assert first is True
    assert second is True


@mock_aws
def test_allow_key_blocks_requests_over_the_limit() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=2, window_seconds=60, daily_max=100
    )
    limiter.allow_key("1.2.3.4", now=0.0)
    limiter.allow_key("1.2.3.4", now=1.0)

    # Act
    third = limiter.allow_key("1.2.3.4", now=2.0)

    # Assert
    assert third is False


@mock_aws
def test_allow_key_accepts_again_in_a_new_window() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=1, window_seconds=60, daily_max=100
    )
    limiter.allow_key("1.2.3.4", now=0.0)

    # Act
    after_window = limiter.allow_key("1.2.3.4", now=61.0)

    # Assert
    assert after_window is True


@mock_aws
def test_allow_key_tracks_keys_independently() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=1, window_seconds=60, daily_max=100
    )
    limiter.allow_key("1.1.1.1", now=0.0)

    # Act
    other_key = limiter.allow_key("2.2.2.2", now=0.0)

    # Assert
    assert other_key is True


@mock_aws
def test_allow_daily_blocks_once_the_global_daily_cap_is_reached() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=5, window_seconds=60, daily_max=2
    )
    limiter.allow_daily(now=0.0)
    limiter.allow_daily(now=1.0)

    # Act
    third = limiter.allow_daily(now=2.0)

    # Assert
    assert third is False


@mock_aws
def test_allow_daily_resets_on_a_new_utc_day() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=5, window_seconds=60, daily_max=1
    )
    limiter.allow_daily(now=0.0)

    # Act
    next_day = limiter.allow_daily(now=86_400.0)

    # Assert
    assert next_day is True


@mock_aws
def test_allow_key_does_not_spend_the_daily_cap() -> None:
    # Arrange: per-key hits alone must never touch the global counter.
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=5, window_seconds=60, daily_max=1
    )
    limiter.allow_key("1.1.1.1", now=0.0)
    limiter.allow_key("2.2.2.2", now=1.0)

    # Act
    daily = limiter.allow_daily(now=2.0)

    # Assert
    assert daily is True


@mock_aws
def test_allow_daily_sets_a_ttl_on_the_global_counter() -> None:
    # Arrange
    table = _make_table()
    limiter = DynamoRateLimiter(table, max_requests=1, window_seconds=60, daily_max=5)

    # Act
    limiter.allow_daily(now=0.0)

    # Assert
    item = table.get_item(Key={"pk": "global#1970-01-01"})["Item"]
    assert item["expires_at"] == 86_400 + 60


@mock_aws
def test_allow_key_raises_unavailable_when_dynamodb_errors() -> None:
    # Arrange: the table is never created, so update_item raises a ClientError.
    dynamodb = boto3.resource("dynamodb", region_name=_REGION)
    limiter = DynamoRateLimiter(
        dynamodb.Table("missing-table"), max_requests=1, window_seconds=60, daily_max=5
    )

    # Act / Assert
    with pytest.raises(RateLimiterUnavailableError):
        limiter.allow_key("1.2.3.4", now=0.0)


@mock_aws
def test_allow_daily_raises_unavailable_when_dynamodb_errors() -> None:
    # Arrange: the table is never created, so update_item raises a ClientError.
    dynamodb = boto3.resource("dynamodb", region_name=_REGION)
    limiter = DynamoRateLimiter(
        dynamodb.Table("missing-table"), max_requests=1, window_seconds=60, daily_max=5
    )

    # Act / Assert
    with pytest.raises(RateLimiterUnavailableError):
        limiter.allow_daily(now=0.0)
