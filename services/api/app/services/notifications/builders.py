from typing import Any

from app.services.notifications.models import (
    AppDestinationTarget,
    CreateNotificationRequest,
    ExternalUrlTarget,
    NotificationChannels,
    NotificationPlatform,
    NotificationTargetPayload,
)


def app_destination_target(destination_id: str) -> AppDestinationTarget:
    return AppDestinationTarget(type="app_destination", target=destination_id)


def external_url_target(url: str) -> ExternalUrlTarget:
    return ExternalUrlTarget(type="external_url", target=url)


def notification_channels(
    *,
    in_app: bool = True,
    email: bool = False,
    push: bool = False,
) -> NotificationChannels:
    return NotificationChannels(in_app=in_app, email=email, push=push)


def build_notification_request(
    *,
    group_key: str,
    title: str,
    body: str,
    type: str = "info",
    platform: NotificationPlatform | None = None,
    target: NotificationTargetPayload | None = None,
    metadata: dict[str, Any] | None = None,
    unique_key: str | None = None,
    source_action_id: str | None = None,
    channels: NotificationChannels | dict[str, bool] | None = None,
) -> CreateNotificationRequest:
    return CreateNotificationRequest(
        group_key=group_key,
        type=type,
        title=title,
        body=body,
        platform=platform,
        target=target,
        metadata=metadata or {},
        unique_key=unique_key,
        source_action_id=source_action_id,
        channels=channels if channels is not None else notification_channels(),
    )
