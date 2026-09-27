"""Tolerant parsing of stored items into response models.

An item written before a schema change must not turn a whole list into a
500: it is left out and logged by key instead, and
``python -m seed.seed --replace`` (or re-saving it) brings it back.
"""

import logging
from collections.abc import Iterable
from typing import Any

from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


def parse_item[M: BaseModel](
    model: type[M], item: dict[str, Any], *, key: str, event: str
) -> M | None:
    """Parse one stored item, or return ``None`` when it no longer fits.

    Parameters
    ----------
    model : type[pydantic.BaseModel]
        Response model the item must match.
    item : dict[str, Any]
        Raw item read from DynamoDB.
    key : str
        Name of the attribute that identifies the item in the log.
    event : str
        Log event name, e.g. ``"project_invalid_shape"``.

    Returns
    -------
    pydantic.BaseModel or None
        The parsed model, or ``None`` for an item in an outdated shape.
    """
    try:
        return model.model_validate(item)
    except ValidationError:
        logger.warning(event, extra={key: item.get(key)})
        return None


def parse_items[M: BaseModel](
    model: type[M], items: Iterable[dict[str, Any]], *, key: str, event: str
) -> list[M]:
    """Parse stored items, leaving out (and logging) those that no longer fit.

    Parameters
    ----------
    model : type[pydantic.BaseModel]
        Response model each item must match.
    items : Iterable[dict[str, Any]]
        Raw items read from DynamoDB.
    key : str
        Name of the attribute that identifies an item in the log.
    event : str
        Log event name, e.g. ``"article_invalid_shape"``.

    Returns
    -------
    list[pydantic.BaseModel]
        The items that parse, in their original order.
    """
    parsed = (parse_item(model, item, key=key, event=event) for item in items)
    return [item for item in parsed if item is not None]
