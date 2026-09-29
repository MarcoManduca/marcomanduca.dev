"""Unit tests for the cached boto3 factories and their shared config."""

from typing import Any

import pytest

from src.utils.aws_clients import get_client, get_resource


def _client_config(service: str) -> Any:
    """Return the botocore config of a freshly built client."""
    return get_client(service, "eu-west-1").meta.config


def _resource_config(service: str) -> Any:
    """Return the botocore config of a freshly built resource."""
    return get_resource(service, "eu-west-1").meta.client.meta.config


@pytest.mark.parametrize("build", [_client_config, _resource_config])
@pytest.mark.parametrize(
    ("attribute", "expected"),
    [
        ("connect_timeout", 2),
        ("read_timeout", 3),
        ("retries", {"mode": "standard", "total_max_attempts": 3}),
    ],
)
def test_factories_bound_timeouts_and_retries(
    build: Any, attribute: str, expected: object
) -> None:
    # Act
    config = build("dynamodb")

    # Assert
    assert getattr(config, attribute) == expected


def test_get_client_keeps_explicit_signature_version() -> None:
    # Act
    config = get_client("s3", "eu-west-1", "s3v4").meta.config

    # Assert
    assert config.signature_version == "s3v4"
    assert config.read_timeout == 3
