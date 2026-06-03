from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


NotificationPlatform = Literal["web", "native"]
NotificationChannel = Literal["email", "push"]


class NotificationChannels(BaseModel):
    in_app: bool = True
    email: bool = False
    push: bool = False


class CreateNotificationRequest(BaseModel):
    group_key: str = Field(min_length=2, max_length=80, pattern=r"^[a-z][a-z0-9_.:-]*$")
    type: str = Field(default="info", min_length=2, max_length=80, pattern=r"^[a-z][a-z0-9_.:-]*$")
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=500)
    platform: NotificationPlatform | None = None
    href: str | None = Field(default=None, max_length=500)
    metadata: dict[str, Any] = Field(default_factory=dict)
    unique_key: str | None = Field(
        default=None,
        min_length=2,
        max_length=160,
        pattern=r"^[a-z][a-z0-9_.:-]*$",
    )
    source_activity_event_id: str | None = None
    channels: NotificationChannels = Field(default_factory=NotificationChannels)


class Notification(BaseModel):
    id: str
    user_id: str
    group_key: str
    type: str
    title: str
    body: str
    platform: NotificationPlatform | None = None
    href: str | None = None
    in_app_visible: bool = True
    metadata: dict[str, Any]
    unique_key: str | None = None
    source_activity_event_id: str | None = None
    read_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class NotificationPreferencePatch(BaseModel):
    in_app_enabled: bool | None = None
    email_enabled: bool | None = None
    push_enabled: bool | None = None


class NotificationPreference(BaseModel):
    id: str
    user_id: str
    group_key: str
    in_app_enabled: bool
    email_enabled: bool
    push_enabled: bool
    created_at: datetime
    updated_at: datetime


class PushTokenRequest(BaseModel):
    token: str = Field(min_length=8, max_length=500)
    device_id: str | None = Field(default=None, max_length=200)


class DeliveryAttempt(BaseModel):
    id: str
    user_id: str
    notification_id: str | None = None
    channel: NotificationChannel
    status: Literal["sent", "skipped", "failed"]
    provider: str
    target: str | None = None
    response: dict[str, Any]
    error: str | None = None
    created_at: datetime
