from datetime import datetime
from typing import Any, Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

from app.services.notifications.registry import has_notification_destination

NotificationPlatform = Literal["web", "native"]
NotificationChannel = Literal["email", "push"]


class NotificationChannels(BaseModel):
    model_config = ConfigDict(extra="forbid")

    in_app: bool = True
    email: bool = False
    push: bool = False


class AppDestinationTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["app_destination"]
    target: str = Field(
        min_length=1,
        max_length=120,
        pattern=r"^[a-z][a-z0-9_.:-]*$",
    )


class ExternalUrlTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["external_url"]
    target: HttpUrl


NotificationTargetPayload = AppDestinationTarget | ExternalUrlTarget

NotificationTarget = Annotated[
    NotificationTargetPayload,
    Field(discriminator="type"),
]


class CreateNotificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    group_key: str = Field(min_length=2, max_length=80, pattern=r"^[a-z][a-z0-9_.:-]*$")
    type: str = Field(default="info", min_length=2, max_length=80, pattern=r"^[a-z][a-z0-9_.:-]*$")
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=500)
    platform: NotificationPlatform | None = None
    target: NotificationTarget | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    unique_key: str | None = Field(
        default=None,
        min_length=2,
        max_length=160,
        pattern=r"^[a-z][a-z0-9_.:-]*$",
    )
    source_action_id: str | None = None
    channels: NotificationChannels = Field(default_factory=NotificationChannels)

    @model_validator(mode="after")
    def validate_target(self) -> "CreateNotificationRequest":
        if self.target and self.target.type == "app_destination":
            if not has_notification_destination(self.target.target):
                raise ValueError(
                    f"Unknown app destination target: {self.target.target}"
                )
        return self


class Notification(BaseModel):
    id: str
    user_id: str
    group_key: str
    type: str
    title: str
    body: str
    platform: NotificationPlatform | None = None
    target: NotificationTarget | None = None
    in_app_visible: bool = True
    metadata: dict[str, Any]
    unique_key: str | None = None
    source_action_id: str | None = None
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
