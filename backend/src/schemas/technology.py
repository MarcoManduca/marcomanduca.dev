"""Request/response models for technologies."""

from pydantic import BaseModel, Field


class TechnologyCreate(BaseModel):
    """Payload to register a technology; the id derives from the name.

    Attributes
    ----------
    name : str
        Display name (for example ``"FastAPI"``).
    icon : str
        Icon identifier or S3 key.
    category : str
        Grouping label (for example ``"backend"``).
    """

    name: str = Field(min_length=1, max_length=64)
    icon: str = Field(min_length=1, max_length=256)
    category: str = Field(min_length=1, max_length=64)


class TechnologyResponse(TechnologyCreate):
    """Technology as returned by the API.

    Attributes
    ----------
    id : str
        Primary key, generated from the name.
    """

    id: str
