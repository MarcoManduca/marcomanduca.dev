"""Unit tests for the DynamoDB-backed rate limiter."""

from typing import Any

import boto3
import pytest
from moto import mock_aws
from starlette.requests import Request

from src.utils.rate_limit import (
    DynamoRateLimiter,
    RateLimiterUnavailableError,
    client_ip,
)

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
def test_is_allowed_accepts_requests_under_the_limit() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=2, window_seconds=60, daily_max=100
    )

    # Act
    first = limiter.is_allowed("1.2.3.4", now=0.0)
    second = limiter.is_allowed("1.2.3.4", now=1.0)

    # Assert
    assert first is True
    assert second is True


@mock_aws
def test_is_allowed_blocks_requests_over_the_limit() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=2, window_seconds=60, daily_max=100
    )
    limiter.is_allowed("1.2.3.4", now=0.0)
    limiter.is_allowed("1.2.3.4", now=1.0)

    # Act
    third = limiter.is_allowed("1.2.3.4", now=2.0)

    # Assert
    assert third is False


@mock_aws
def test_is_allowed_accepts_again_in_a_new_window() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=1, window_seconds=60, daily_max=100
    )
    limiter.is_allowed("1.2.3.4", now=0.0)

    # Act
    after_window = limiter.is_allowed("1.2.3.4", now=61.0)

    # Assert
    assert after_window is True


@mock_aws
def test_is_allowed_tracks_keys_independently() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=1, window_seconds=60, daily_max=100
    )
    limiter.is_allowed("1.1.1.1", now=0.0)

    # Act
    other_key = limiter.is_allowed("2.2.2.2", now=0.0)

    # Assert
    assert other_key is True


@mock_aws
def test_is_allowed_blocks_once_the_global_daily_cap_is_reached() -> None:
    # Arrange: distinct IPs, each well under its own per-window limit.
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=5, window_seconds=60, daily_max=2
    )
    limiter.is_allowed("1.1.1.1", now=0.0)
    limiter.is_allowed("2.2.2.2", now=1.0)

    # Act
    third_ip = limiter.is_allowed("3.3.3.3", now=2.0)

    # Assert
    assert third_ip is False


@mock_aws
def test_is_allowed_resets_the_global_cap_on_a_new_utc_day() -> None:
    # Arrange
    limiter = DynamoRateLimiter(
        _make_table(), max_requests=5, window_seconds=60, daily_max=1
    )
    limiter.is_allowed("1.1.1.1", now=0.0)

    # Act
    next_day = limiter.is_allowed("2.2.2.2", now=86_400.0)

    # Assert
    assert next_day is True


@mock_aws
def test_is_allowed_does_not_count_rejected_requests_against_the_daily_cap() -> None:
    # Arrange: one IP exhausts its window; its extra hits must not burn budget.
    table = _make_table()
    limiter = DynamoRateLimiter(table, max_requests=1, window_seconds=60, daily_max=2)
    limiter.is_allowed("1.1.1.1", now=0.0)
    limiter.is_allowed("1.1.1.1", now=1.0)
    limiter.is_allowed("1.1.1.1", now=2.0)

    # Act
    other_ip = limiter.is_allowed("2.2.2.2", now=3.0)

    # Assert
    assert other_ip is True


@mock_aws
def test_is_allowed_sets_a_ttl_on_the_global_counter() -> None:
    # Arrange
    table = _make_table()
    limiter = DynamoRateLimiter(table, max_requests=1, window_seconds=60, daily_max=5)

    # Act
    limiter.is_allowed("1.1.1.1", now=0.0)

    # Assert
    item = table.get_item(Key={"pk": "global#1970-01-01"})["Item"]
    assert item["expires_at"] == 86_400 + 60


@mock_aws
def test_is_allowed_raises_unavailable_when_dynamodb_errors() -> None:
    # Arrange: the table is never created, so update_item raises a ClientError.
    dynamodb = boto3.resource("dynamodb", region_name=_REGION)
    limiter = DynamoRateLimiter(
        dynamodb.Table("missing-table"), max_requests=1, window_seconds=60, daily_max=5
    )

    # Act / Assert
    with pytest.raises(RateLimiterUnavailableError):
        limiter.is_allowed("1.2.3.4", now=0.0)


def _request(headers: dict[str, str], peer: str = "10.0.0.1") -> Request:
    """Build a bare Starlette request with the given headers and peer IP."""
    return Request(
        {
            "type": "http",
            "headers": [(k.encode(), v.encode()) for k, v in headers.items()],
            "client": (peer, 1234),
        }
    )


@pytest.mark.parametrize(
    "headers, expected",
    [
        ({"x-viewer-ip": "203.0.113.7"}, "203.0.113.7"),
        ({"x-viewer-ip": "203.0.113.7", "x-forwarded-for": "6.6.6.6"}, "203.0.113.7"),
        ({"x-forwarded-for": "6.6.6.6, 7.7.7.7"}, "10.0.0.1"),
        ({}, "10.0.0.1"),
    ],
)
def test_client_ip_prefers_viewer_ip_and_ignores_forwarded_for(
    headers: dict[str, str], expected: str
) -> None:
    # Act
    result = client_ip(_request(headers))

    # Assert
    assert result == expected
