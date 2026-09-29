"""Cached boto3 client and resource factories.

Building a boto3 client costs tens of milliseconds (endpoint and model
loading), so each distinct configuration is built once per execution
environment and reused across requests. Lambda serves one request at a
time per environment, so sharing the objects is safe there; tests clear
the caches between cases with :func:`clear_aws_caches`.

Every client and resource gets short timeouts and a bounded retry budget.
The botocore defaults (60 s connect/read, legacy retries with up to 10
DynamoDB attempts) outlast the 30 s Lambda timeout, so a slow AWS call
would end as a gateway timeout instead of the API's own 503.
"""

from functools import lru_cache
from typing import Any

import boto3
from botocore.config import Config

# Worst case per call: 3 attempts in total (the first try included), each
# up to 2 s connect + 3 s read, plus backoff: about 17 s, well below the
# 30 s Lambda / API Gateway timeout.
DEFAULT_CONFIG = Config(
    connect_timeout=2,
    read_timeout=3,
    retries={"mode": "standard", "total_max_attempts": 3},
)


@lru_cache
def get_client(service: str, region: str, signature_version: str | None = None) -> Any:
    """Return a cached boto3 client.

    Parameters
    ----------
    service : str
        AWS service name, for example ``"s3"`` or ``"ses"``.
    region : str
        AWS region the client targets.
    signature_version : str, optional
        Explicit signer (for example ``"s3v4"`` for presigned S3 URLs).

    Returns
    -------
    Any
        A boto3 low-level client using :data:`DEFAULT_CONFIG`.
    """
    config = DEFAULT_CONFIG
    if signature_version:
        config = config.merge(Config(signature_version=signature_version))
    return boto3.client(service, region_name=region, config=config)


@lru_cache
def get_resource(service: str, region: str, endpoint_url: str | None = None) -> Any:
    """Return a cached boto3 resource.

    Parameters
    ----------
    service : str
        AWS service name, for example ``"dynamodb"``.
    region : str
        AWS region the resource targets.
    endpoint_url : str, optional
        Custom endpoint (for example DynamoDB Local).

    Returns
    -------
    Any
        A boto3 service resource using :data:`DEFAULT_CONFIG`.
    """
    kwargs: dict[str, Any] = {"region_name": region, "config": DEFAULT_CONFIG}
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url
    return boto3.resource(service, **kwargs)


def clear_aws_caches() -> None:
    """Drop every cached client and resource (used by tests)."""
    get_client.cache_clear()
    get_resource.cache_clear()
