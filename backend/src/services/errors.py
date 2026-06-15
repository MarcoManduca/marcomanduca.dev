"""Domain errors raised by services and mapped to HTTP responses."""


class NotFoundError(Exception):
    """Raised when a requested resource does not exist (HTTP 404)."""


class ConflictError(Exception):
    """Raised when a resource identifier is already taken (HTTP 409)."""


class InvalidInputError(Exception):
    """Raised when a semantically invalid value is supplied (HTTP 400)."""


class EmailDeliveryError(Exception):
    """Raised when an outbound email cannot be delivered (HTTP 503)."""
