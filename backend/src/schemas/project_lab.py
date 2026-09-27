"""The optional lab of a project page: an interactive demo.

The only lab today is ``image-compare``: each sample is a base image with
up to four layers (a model output, the ground truth, a residual...) that a
slider reveals over it.
"""

from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from src.schemas.common import LocalizedLabel, LocalizedLine, MediaRef
from src.schemas.project_parts import MediaItem
from src.schemas.project_taxonomy import LabKind

LabId = Annotated[str, Field(pattern=r"^[a-z0-9][a-z0-9-]{0,31}$")]


def _require_unique_ids[ItemT: LabLayer | LabSample](
    items: list[ItemT],
) -> list[ItemT]:
    """Reject a list where two entries share the same ``id``.

    Parameters
    ----------
    items : list
        Layers or samples, each with an ``id``.

    Returns
    -------
    list
        The unchanged list.

    Raises
    ------
    ValueError
        When an ``id`` repeats.
    """
    ids = [item.id for item in items]
    if len(ids) != len(set(ids)):
        raise ValueError("Ids must be unique.")
    return items


class LabLayer(BaseModel):
    """One image the slider reveals over a sample's base image.

    Attributes
    ----------
    id : str
        Stable identifier within the sample (``"predicted"``).
    label : LocalizedLabel
        Name of the view (``"IR previsto"``).
    src : str
        Image URL or media-bucket key.
    alt : LocalizedLine
        Alternative text of the image.
    description : LocalizedLine
        How to read the view.
    """

    id: LabId
    label: LocalizedLabel
    src: MediaRef
    alt: LocalizedLine
    description: LocalizedLine


class LabSample(BaseModel):
    """A ready-made example: a base image and its layers.

    Attributes
    ----------
    id : str
        Stable identifier within the lab (``"gt01"``).
    label : LocalizedLabel
        Name of the example.
    base : MediaItem
        The image every layer is compared against.
    layers : list[LabLayer]
        One to four views, with distinct ids.
    """

    id: LabId
    label: LocalizedLabel
    base: MediaItem
    layers: list[LabLayer] = Field(min_length=1, max_length=4)

    _unique_layers = field_validator("layers")(_require_unique_ids)


class ProjectLab(BaseModel):
    """Interactive demo of a project, shown only when present.

    Attributes
    ----------
    kind : LabKind
        Which demo the page embeds.
    model : str or None
        Name of the model behind the outputs, shown as a tag.
    samples : list[LabSample]
        One to six examples, with distinct ids.
    """

    kind: LabKind = LabKind.IMAGE_COMPARE
    model: str | None = Field(default=None, min_length=1, max_length=64)
    samples: list[LabSample] = Field(min_length=1, max_length=6)

    _unique_samples = field_validator("samples")(_require_unique_ids)
