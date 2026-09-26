"""Cached boto3 client and resource factories.

Building a boto3 client costs tens of milliseconds (endpoint and model
loading), so each distinct configuration is built once per execution
environment and reused across requests. Lambda serves one request at a
time per environment, so sharing the objects is safe there; tests clear
the caches between cases with :func:`clear_aws_caches`.
"""

from functools import lru_cache
from typing import Any

import boto3
from botocore.config import Config


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
        A boto3 low-level client.
    """
    config = Config(signature_version=signature_version) if signature_version else None
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
        A boto3 service resource.
    """
    kwargs: dict[str, Any] = {"region_name": region}
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url
    return boto3.resource(service, **kwargs)


def clear_aws_caches() -> None:
    """Drop every cached client and resource (used by tests)."""
    get_client.cache_clear()
    get_resource.cache_clear()
