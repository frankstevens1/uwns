from datetime import UTC, datetime
from typing import Any

from app.db import SupabaseRestClient
from app.services.notifications.registry import get_notification_group_keys
from app.services.notifications.models import (
    CreateNotificationRequest,
    DeliveryAttempt,
    Notification,
    NotificationPreference,
    NotificationPreferencePatch,
    PushTokenRequest,
)


DEFAULT_NOTIFICATION_GROUPS = get_notification_group_keys()


class NotificationsRepository:
    def __init__(self, db: SupabaseRestClient | None = None) -> None:
        self.db = db or SupabaseRestClient()

    def create_or_update_notification(
        self,
        user_id: str,
        request: CreateNotificationRequest,
        *,
        in_app_visible: bool = True,
        reset_read: bool = True,
    ) -> Notification:
        now = datetime.now(UTC).isoformat()
        values = {
            "user_id": user_id,
            "group_key": request.group_key,
            "type": request.type,
            "title": request.title,
            "body": request.body,
            "platform": request.platform,
            "target": request.target.model_dump(mode="json") if request.target else None,
            "in_app_visible": in_app_visible,
            "metadata": request.metadata,
            "unique_key": request.unique_key,
            "source_action_id": request.source_action_id,
            "updated_at": now,
        }
        if reset_read:
            values["read_at"] = None

        if request.unique_key:
            existing = self.find_notification_by_unique_key(user_id, request.unique_key)
            if existing:
                rows = self.db.patch(
                    "notifications",
                    {"id": f"eq.{existing.id}", "user_id": f"eq.{user_id}"},
                    values,
                )
                return Notification.model_validate(rows[0])

        rows = self.db.insert("notifications", [values])
        return Notification.model_validate(rows[0])

    def create_notification_if_missing(
        self,
        user_id: str,
        request: CreateNotificationRequest,
        *,
        in_app_visible: bool = True,
    ) -> Notification:
        if request.unique_key:
            existing = self.find_notification_by_unique_key(user_id, request.unique_key)
            if existing:
                return existing

        return self.create_or_update_notification(
            user_id,
            request,
            in_app_visible=in_app_visible,
        )

    def find_notification_by_unique_key(
        self,
        user_id: str,
        unique_key: str,
    ) -> Notification | None:
        rows = self.db.select(
            "notifications",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "unique_key": f"eq.{unique_key}",
                "limit": "1",
            },
        )
        if not rows:
            return None
        return Notification.model_validate(rows[0])

    def find_notification_by_id(
        self,
        user_id: str,
        notification_id: str,
    ) -> Notification | None:
        rows = self.db.select(
            "notifications",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "id": f"eq.{notification_id}",
                "limit": "1",
            },
        )
        if not rows:
            return None
        return Notification.model_validate(rows[0])

    def has_action(
        self,
        user_id: str,
        action_name: str,
        platform: str,
    ) -> bool:
        rows = self.db.select(
            "actions",
            {
                "select": "id",
                "user_id": f"eq.{user_id}",
                "action_name": f"eq.{action_name}",
                "platform": f"eq.{platform}",
                "limit": "1",
            },
        )
        return bool(rows)

    def list_notifications(self, user_id: str, limit: int = 25) -> list[Notification]:
        rows = self.db.select(
            "notifications",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "in_app_visible": "eq.true",
                "order": "created_at.desc",
                "limit": str(limit),
            },
        )
        return [Notification.model_validate(row) for row in rows]

    def mark_notification_read(self, user_id: str, notification_id: str) -> Notification | None:
        rows = self.db.patch(
            "notifications",
            {"id": f"eq.{notification_id}", "user_id": f"eq.{user_id}"},
            {"read_at": datetime.now(UTC).isoformat(), "updated_at": datetime.now(UTC).isoformat()},
        )
        if not rows:
            return None
        return Notification.model_validate(rows[0])

    def mark_notification_read_by_unique_key(
        self,
        user_id: str,
        unique_key: str,
    ) -> Notification | None:
        rows = self.db.patch(
            "notifications",
            {"unique_key": f"eq.{unique_key}", "user_id": f"eq.{user_id}"},
            {"read_at": datetime.now(UTC).isoformat(), "updated_at": datetime.now(UTC).isoformat()},
        )
        if not rows:
            return None
        return Notification.model_validate(rows[0])

    def mark_notifications_read_by_auto_read_action(
        self,
        user_id: str,
        action_name: str,
    ) -> list[Notification]:
        now = datetime.now(UTC).isoformat()
        rows = self.db.patch(
            "notifications",
            {
                "user_id": f"eq.{user_id}",
                "read_at": "is.null",
                "metadata->>autoReadActionName": f"eq.{action_name}",
            },
            {"read_at": now, "updated_at": now},
        )
        return [Notification.model_validate(row) for row in rows]

    def mark_all_notifications_read(self, user_id: str) -> list[Notification]:
        rows = self.db.patch(
            "notifications",
            {"user_id": f"eq.{user_id}", "read_at": "is.null"},
            {"read_at": datetime.now(UTC).isoformat(), "updated_at": datetime.now(UTC).isoformat()},
        )
        return [Notification.model_validate(row) for row in rows]

    def get_or_create_preference(
        self,
        user_id: str,
        group_key: str,
    ) -> NotificationPreference:
        rows = self.db.select(
            "notification_preferences",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "group_key": f"eq.{group_key}",
                "limit": "1",
            },
        )
        if rows:
            return NotificationPreference.model_validate(rows[0])

        created = self.db.insert(
            "notification_preferences",
            [{"user_id": user_id, "group_key": group_key}],
        )
        return NotificationPreference.model_validate(created[0])

    def list_preferences(self, user_id: str) -> list[NotificationPreference]:
        for group_key in DEFAULT_NOTIFICATION_GROUPS:
            self.get_or_create_preference(user_id, group_key)

        rows = self.db.select(
            "notification_preferences",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "order": "group_key.asc",
            },
        )
        return [NotificationPreference.model_validate(row) for row in rows]

    def update_preference(
        self,
        user_id: str,
        group_key: str,
        patch: NotificationPreferencePatch,
    ) -> NotificationPreference:
        existing = self.get_or_create_preference(user_id, group_key)
        values = patch.model_dump(exclude_none=True)
        values["updated_at"] = datetime.now(UTC).isoformat()

        rows = self.db.patch(
            "notification_preferences",
            {"id": f"eq.{existing.id}", "user_id": f"eq.{user_id}"},
            values,
        )
        return NotificationPreference.model_validate(rows[0])

    def register_push_token(
        self,
        user_id: str,
        request: PushTokenRequest,
    ) -> dict[str, Any]:
        rows = self.db.select(
            "notification_push_tokens",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "token": f"eq.{request.token}",
                "limit": "1",
            },
        )
        values = {
            "user_id": user_id,
            "token": request.token,
            "platform": "native",
            "device_id": request.device_id,
            "updated_at": datetime.now(UTC).isoformat(),
        }
        if rows:
            updated = self.db.patch(
                "notification_push_tokens",
                {"id": f"eq.{rows[0]['id']}", "user_id": f"eq.{user_id}"},
                values,
            )
            return updated[0]

        created = self.db.insert("notification_push_tokens", [values])
        return created[0]

    def list_push_tokens(self, user_id: str) -> list[dict[str, Any]]:
        return self.db.select(
            "notification_push_tokens",
            {"select": "*", "user_id": f"eq.{user_id}"},
        )

    def unregister_push_token(self, user_id: str, token: str) -> None:
        self.db.patch(
            "notification_push_tokens",
            {"user_id": f"eq.{user_id}", "token": f"eq.{token}"},
            {"device_id": None, "updated_at": datetime.now(UTC).isoformat()},
        )

    def record_delivery_attempt(
        self,
        *,
        user_id: str,
        notification_id: str | None,
        channel: str,
        status: str,
        provider: str,
        target: str | None = None,
        response: dict[str, Any] | None = None,
        error: str | None = None,
    ) -> DeliveryAttempt:
        rows = self.db.insert(
            "notification_delivery_attempts",
            [
                {
                    "user_id": user_id,
                    "notification_id": notification_id,
                    "channel": channel,
                    "status": status,
                    "provider": provider,
                    "target": target,
                    "response": response or {},
                    "error": error,
                }
            ],
        )
        return DeliveryAttempt.model_validate(rows[0])
