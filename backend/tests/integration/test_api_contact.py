"""Integration tests for the contact API (honeypot, rate limit)."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from src.config import get_settings
from src.schemas.contact import ContactRequest
from src.services.contact_service import get_contact_service
from src.utils.rate_limit import reset_contact_limiter

pytestmark = pytest.mark.integration

_VALID_PAYLOAD = {
    "name": "Alice",
    "email": "alice@example.com",
    "message": "Hello Marco!",
    "website": "",
}


class _StubContactService:
    """Records sent payloads instead of calling SES."""

    def __init__(self) -> None:
        self.sent: list[ContactRequest] = []

    def send_contact_email(self, payload: ContactRequest) -> None:
        self.sent.append(payload)


@pytest.fixture
def contact_stub(app: FastAPI) -> _StubContactService:
    """Replace the contact service with a recording stub."""
    stub = _StubContactService()
    app.dependency_overrides[get_contact_service] = lambda: stub
    return stub


async def test_submit_contact_returns_202_and_sends_email(
    public_client: AsyncClient, contact_stub: _StubContactService
) -> None:
    # Act
    response = await public_client.post("/api/v1/contact", json=_VALID_PAYLOAD)

    # Assert
    assert response.status_code == 202
    assert len(contact_stub.sent) == 1


async def test_submit_contact_with_honeypot_skips_email(
    public_client: AsyncClient, contact_stub: _StubContactService
) -> None:
    # Arrange
    spam_payload = _VALID_PAYLOAD | {"website": "http://spam.example.com"}

    # Act
    response = await public_client.post("/api/v1/contact", json=spam_payload)

    # Assert
    assert response.status_code == 202
    assert contact_stub.sent == []


async def test_submit_contact_returns_422_on_invalid_email(
    public_client: AsyncClient, contact_stub: _StubContactService
) -> None:
    # Arrange
    bad_payload = _VALID_PAYLOAD | {"email": "not-an-email"}

    # Act
    response = await public_client.post("/api/v1/contact", json=bad_payload)

    # Assert
    assert response.status_code == 422
    assert contact_stub.sent == []


async def test_submit_contact_returns_429_over_rate_limit(
    app: FastAPI,
    contact_stub: _StubContactService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    monkeypatch.setenv("CONTACT_RATE_LIMIT_MAX_REQUESTS", "2")
    get_settings.cache_clear()
    reset_contact_limiter()
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        first = await client.post("/api/v1/contact", json=_VALID_PAYLOAD)
        second = await client.post("/api/v1/contact", json=_VALID_PAYLOAD)
        third = await client.post("/api/v1/contact", json=_VALID_PAYLOAD)

    # Assert
    assert first.status_code == 202
    assert second.status_code == 202
    assert third.status_code == 429


@pytest.fixture
def limited_client(
    app: FastAPI, contact_stub: _StubContactService, monkeypatch: pytest.MonkeyPatch
) -> AsyncClient:
    """Client whose contact limit is one request per IP per window."""
    monkeypatch.setenv("CONTACT_RATE_LIMIT_MAX_REQUESTS", "1")
    get_settings.cache_clear()
    reset_contact_limiter()
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def test_submit_contact_ignores_spoofed_forwarded_for(
    limited_client: AsyncClient,
) -> None:
    # Act: rotating X-Forwarded-For must not create fresh buckets.
    async with limited_client as client:
        first = await client.post(
            "/api/v1/contact",
            json=_VALID_PAYLOAD,
            headers={"X-Forwarded-For": "1.1.1.1"},
        )
        second = await client.post(
            "/api/v1/contact",
            json=_VALID_PAYLOAD,
            headers={"X-Forwarded-For": "2.2.2.2"},
        )

    # Assert
    assert first.status_code == 202
    assert second.status_code == 429


async def test_submit_contact_buckets_by_viewer_ip(
    limited_client: AsyncClient,
) -> None:
    # Act
    async with limited_client as client:
        first = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "1.1.1.1"}
        )
        other_viewer = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "2.2.2.2"}
        )
        same_viewer = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "1.1.1.1"}
        )

    # Assert
    assert first.status_code == 202
    assert other_viewer.status_code == 202
    assert same_viewer.status_code == 429


async def test_submit_contact_returns_429_when_daily_cap_is_reached(
    app: FastAPI,
    contact_stub: _StubContactService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange
    monkeypatch.setenv("CONTACT_RATE_LIMIT_DAILY_MAX", "1")
    get_settings.cache_clear()
    reset_contact_limiter()
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        first = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "1.1.1.1"}
        )
        second = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "2.2.2.2"}
        )

    # Assert
    assert first.status_code == 202
    assert second.status_code == 429


async def test_submit_contact_returns_503_when_rate_limit_backend_fails(
    app: FastAPI,
    contact_stub: _StubContactService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Arrange: point the limiter at a table that does not exist.
    monkeypatch.setenv("RATELIMIT_TABLE_NAME", "missing-table")
    get_settings.cache_clear()
    reset_contact_limiter()
    transport = ASGITransport(app=app)

    # Act
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/contact", json=_VALID_PAYLOAD)

    # Assert
    assert response.status_code == 503
    assert contact_stub.sent == []


async def test_submit_contact_buckets_ipv6_viewers_by_64(
    limited_client: AsyncClient,
) -> None:
    # Act: two addresses of the same /64 are one caller.
    async with limited_client as client:
        first = await client.post(
            "/api/v1/contact",
            json=_VALID_PAYLOAD,
            headers={"X-Viewer-Ip": "2001:db8:1:2::1"},
        )
        same_network = await client.post(
            "/api/v1/contact",
            json=_VALID_PAYLOAD,
            headers={"X-Viewer-Ip": "2001:db8:1:2::ffff"},
        )

    # Assert
    assert first.status_code == 202
    assert same_network.status_code == 429


async def test_submit_contact_throttles_honeypot_hits_per_network(
    limited_client: AsyncClient,
) -> None:
    # Arrange
    spam_payload = _VALID_PAYLOAD | {"website": "http://spam.example.com"}

    # Act
    async with limited_client as client:
        first = await client.post("/api/v1/contact", json=spam_payload)
        second = await client.post("/api/v1/contact", json=spam_payload)

    # Assert
    assert first.status_code == 202
    assert second.status_code == 429


@pytest.fixture
def daily_capped_client(
    app: FastAPI, contact_stub: _StubContactService, monkeypatch: pytest.MonkeyPatch
) -> AsyncClient:
    """Client whose site-wide contact budget is one email per day."""
    monkeypatch.setenv("CONTACT_RATE_LIMIT_DAILY_MAX", "1")
    get_settings.cache_clear()
    reset_contact_limiter()
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def test_submit_contact_honeypot_does_not_spend_the_daily_cap(
    daily_capped_client: AsyncClient, contact_stub: _StubContactService
) -> None:
    # Arrange
    spam_payload = _VALID_PAYLOAD | {"website": "http://spam.example.com"}

    # Act
    async with daily_capped_client as client:
        await client.post(
            "/api/v1/contact", json=spam_payload, headers={"X-Viewer-Ip": "1.1.1.1"}
        )
        genuine = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "2.2.2.2"}
        )

    # Assert
    assert genuine.status_code == 202
    assert len(contact_stub.sent) == 1


async def test_submit_contact_invalid_payload_does_not_spend_the_daily_cap(
    daily_capped_client: AsyncClient, contact_stub: _StubContactService
) -> None:
    # Arrange
    bad_payload = _VALID_PAYLOAD | {"email": "not-an-email"}

    # Act
    async with daily_capped_client as client:
        invalid = await client.post(
            "/api/v1/contact", json=bad_payload, headers={"X-Viewer-Ip": "1.1.1.1"}
        )
        genuine = await client.post(
            "/api/v1/contact", json=_VALID_PAYLOAD, headers={"X-Viewer-Ip": "2.2.2.2"}
        )

    # Assert
    assert invalid.status_code == 422
    assert genuine.status_code == 202
    assert len(contact_stub.sent) == 1
