"""Unit tests for the DynamoDB-backed rate limiter."""

from typing import Any

import boto3
from moto import mock_aws

from src.utils.rate_limit import DynamoRateLimiter

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
    limiter = DynamoRateLimiter(_make_table(), max_requests=2, window_seconds=60)

    # Act
    first = limiter.is_allowed("1.2.3.4", now=0.0)
    second = limiter.is_allowed("1.2.3.4", now=1.0)

    # Assert
    assert first is True
    assert second is True


@mock_aws
def test_is_allowed_blocks_requests_over_the_limit() -> None:
    # Arrange
    limiter = DynamoRateLimiter(_make_table(), max_requests=2, window_seconds=60)
    limiter.is_allowed("1.2.3.4", now=0.0)
    limiter.is_allowed("1.2.3.4", now=1.0)

    # Act
    third = limiter.is_allowed("1.2.3.4", now=2.0)

    # Assert
    assert third is False


@mock_aws
def test_is_allowed_accepts_again_in_a_new_window() -> None:
    # Arrange
    limiter = DynamoRateLimiter(_make_table(), max_requests=1, window_seconds=60)
    limiter.is_allowed("1.2.3.4", now=0.0)

    # Act
    after_window = limiter.is_allowed("1.2.3.4", now=61.0)

    # Assert
    assert after_window is True


@mock_aws
def test_is_allowed_tracks_keys_independently() -> None:
    # Arrange
    limiter = DynamoRateLimiter(_make_table(), max_requests=1, window_seconds=60)
    limiter.is_allowed("1.1.1.1", now=0.0)

    # Act
    other_key = limiter.is_allowed("2.2.2.2", now=0.0)

    # Assert
    assert other_key is True


@mock_aws
def test_is_allowed_fails_open_when_dynamodb_errors() -> None:
    # Arrange: the table is never created, so update_item raises a ClientError.
    dynamodb = boto3.resource("dynamodb", region_name=_REGION)
    limiter = DynamoRateLimiter(
        dynamodb.Table("missing-table"), max_requests=1, window_seconds=60
    )

    # Act
    allowed = limiter.is_allowed("1.2.3.4", now=0.0)

    # Assert
    assert allowed is True
