from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class TrackEventRequest(BaseModel):
    event_name: str = Field(min_length=2, max_length=128, pattern=r"^[a-z][a-z0-9_.:-]*$")
    platform: Literal["web", "native"]
    metadata: dict[str, Any] = Field(default_factory=dict)
    unique_key: str | None = Field(
        default=None,
        min_length=2,
        max_length=160,
        pattern=r"^[a-z][a-z0-9_.:-]*$",
    )
    occurred_at: datetime | None = None


class ActivityEvent(BaseModel):
    id: str
    user_id: str
    event_name: str
    platform: Literal["web", "native"]
    metadata: dict[str, Any]
    unique_key: str | None = None
    occurred_at: datetime
    created_at: datetime
