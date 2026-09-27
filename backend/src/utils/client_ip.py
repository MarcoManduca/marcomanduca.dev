"""Client IP extraction for rate limiting.

The client IP comes from the ``x-viewer-ip`` header, which the CloudFront
viewer-request function on ``/api/*`` overwrites with the true viewer IP.
``X-Forwarded-For`` is never trusted: clients can prepend arbitrary values.
Direct calls to API Gateway that could forge ``x-viewer-ip`` are rejected
earlier by the origin-verify middleware.
"""

import ipaddress

from fastapi import Request

_VIEWER_IP_HEADER = "x-viewer-ip"
# A single IPv6 subscriber usually holds a whole /64, so it is the smallest
# unit a caller cannot rotate through for free.
_IPV6_PREFIX_LENGTH = 64


def client_ip(request: Request) -> str:
    """Return the viewer IP of a request.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request.

    Returns
    -------
    str
        The CloudFront-set ``x-viewer-ip`` header when present, otherwise
        the socket peer address (local development), or ``"unknown"``.
    """
    viewer_ip = request.headers.get(_VIEWER_IP_HEADER, "").strip()
    if viewer_ip:
        return viewer_ip
    return request.client.host if request.client else "unknown"


def network_key(ip: str) -> str:
    """Group an IP address into the network a single caller controls.

    IPv4 addresses are kept as they are, IPv4-mapped IPv6 addresses are
    unwrapped to IPv4, and other IPv6 addresses collapse to their ``/64``.
    Unparseable values are returned unchanged.

    Parameters
    ----------
    ip : str
        Client IP address.

    Returns
    -------
    str
        Rate-limit key, e.g. ``"203.0.113.7"`` or ``"2001:db8::/64"``.
    """
    try:
        address = ipaddress.ip_address(ip)
    except ValueError:
        return ip
    if isinstance(address, ipaddress.IPv6Address):
        if address.ipv4_mapped is not None:
            return str(address.ipv4_mapped)
        network = ipaddress.ip_network(f"{address}/{_IPV6_PREFIX_LENGTH}", strict=False)
        return str(network)
    return str(address)
