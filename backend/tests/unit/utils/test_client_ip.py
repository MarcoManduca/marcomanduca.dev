"""Unit tests for client IP extraction and network grouping."""

import pytest
from starlette.requests import Request

from src.utils.client_ip import client_ip, network_key


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


@pytest.mark.parametrize(
    "ip, expected",
    [
        ("203.0.113.7", "203.0.113.7"),
        ("2001:db8:1:2:aaaa:bbbb:cccc:dddd", "2001:db8:1:2::/64"),
        ("2001:db8:1:2::1", "2001:db8:1:2::/64"),
        ("::ffff:203.0.113.7", "203.0.113.7"),
        ("unknown", "unknown"),
    ],
)
def test_network_key_groups_ipv6_by_64_and_keeps_ipv4(ip: str, expected: str) -> None:
    # Act
    result = network_key(ip)

    # Assert
    assert result == expected


def test_network_key_separates_different_ipv6_64s() -> None:
    # Act
    first = network_key("2001:db8:1:2::1")
    second = network_key("2001:db8:1:3::1")

    # Assert
    assert first != second
