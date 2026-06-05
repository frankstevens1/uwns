from datetime import UTC, datetime
from typing import Any

import pytest
from pydantic import ValidationError
from app.services.actions.models import Action, TrackActionRequest
from app.services.actions.service import ActionsService
from app.services.notifications.builders import (
    app_destination_target,
    external_url_target,
)
from app.services.notifications.models import (
    CreateNotificationRequest,
    Notification,
    NotificationPreference,
    NotificationPreferencePatch,
    PushTokenRequest,
)
from app.services.notifications.registry import get_notification_group_keys
from app.services.notifications.service import NotificationsService


class FakeNotificationsRepository:
    def __init__(self) -> None:
        self.notifications: dict[str, Notification] = {}
        self.preferences: dict[str, NotificationPreference] = {}
        self.push_tokens: list[dict[str, Any]] = []
        self.attempts: list[dict[str, Any]] = []
        self.next_id = 1

    def create_or_update_notification(
        self,
        user_id: str,
        request: CreateNotificationRequest,
        *,
        in_app_visible: bool = True,
        reset_read: bool = True,
    ) -> Notification:
        existing = (
            self.find_notification_by_unique_key(user_id, request.unique_key)
            if request.unique_key
            else None
        )
        now = datetime.now(UTC)
        notification = Notification.model_validate(
            {
                "id": existing.id if existing else f"notification-{self.next_id}",
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
                "read_at": None
                if reset_read or not existing
                else existing.read_at,
                "created_at": existing.created_at if existing else now,
                "updated_at": now,
            }
        )
        if not existing:
            self.next_id += 1
        self.notifications[notification.id] = notification
        return notification

    def find_notification_by_unique_key(
        self,
        user_id: str,
        unique_key: str | None,
    ) -> Notification | None:
        for notification in self.notifications.values():
            if notification.user_id == user_id and notification.unique_key == unique_key:
                return notification
        return None

    def find_notification_by_id(
        self,
        user_id: str,
        notification_id: str,
    ) -> Notification | None:
        notification = self.notifications.get(notification_id)
        if not notification or notification.user_id != user_id:
            return None
        return notification

    def has_action(
        self,
        user_id: str,
        action_name: str,
        platform: str,
    ) -> bool:
        return False

    def list_notifications(self, user_id: str, limit: int = 25) -> list[Notification]:
        return [
            item for item in self.notifications.values() if item.user_id == user_id
        ][:limit]

    def mark_notification_read(
        self,
        user_id: str,
        notification_id: str,
    ) -> Notification | None:
        notification = self.notifications.get(notification_id)
        if not notification or notification.user_id != user_id:
            return None
        updated = notification.model_copy(update={"read_at": datetime.now(UTC)})
        self.notifications[notification_id] = updated
        return updated

    def mark_notification_read_by_unique_key(
        self,
        user_id: str,
        unique_key: str,
    ) -> Notification | None:
        notification = self.find_notification_by_unique_key(user_id, unique_key)
        if not notification:
            return None
        return self.mark_notification_read(user_id, notification.id)

    def mark_notifications_read_by_auto_read_action(
        self,
        user_id: str,
        action_name: str,
    ) -> list[Notification]:
        updated = []
        for notification in list(self.notifications.values()):
            if (
                notification.user_id == user_id
                and not notification.read_at
                and notification.metadata.get("autoReadActionName") == action_name
            ):
                next_notification = notification.model_copy(
                    update={
                        "read_at": datetime.now(UTC),
                        "updated_at": datetime.now(UTC),
                    }
                )
                self.notifications[notification.id] = next_notification
                updated.append(next_notification)
        return updated

    def mark_all_notifications_read(self, user_id: str) -> list[Notification]:
        updated = []
        for notification in list(self.notifications.values()):
            if notification.user_id == user_id and not notification.read_at:
                next_notification = notification.model_copy(
                    update={"read_at": datetime.now(UTC)}
                )
                self.notifications[notification.id] = next_notification
                updated.append(next_notification)
        return updated

    def get_or_create_preference(
        self,
        user_id: str,
        group_key: str,
    ) -> NotificationPreference:
        key = f"{user_id}:{group_key}"
        if key not in self.preferences:
            self.preferences[key] = NotificationPreference.model_validate(
                {
                    "id": f"preference-{len(self.preferences) + 1}",
                    "user_id": user_id,
                    "group_key": group_key,
                    "in_app_enabled": True,
                    "email_enabled": True,
                    "push_enabled": True,
                    "created_at": datetime.now(UTC),
                    "updated_at": datetime.now(UTC),
                }
            )
        return self.preferences[key]

    def list_preferences(self, user_id: str) -> list[NotificationPreference]:
        for group_key in get_notification_group_keys():
            self.get_or_create_preference(user_id, group_key)
        return [item for item in self.preferences.values() if item.user_id == user_id]

    def update_preference(
        self,
        user_id: str,
        group_key: str,
        patch: NotificationPreferencePatch,
    ) -> NotificationPreference:
        current = self.get_or_create_preference(user_id, group_key)
        updated = current.model_copy(update=patch.model_dump(exclude_none=True))
        self.preferences[f"{user_id}:{group_key}"] = updated
        return updated

    def register_push_token(
        self,
        user_id: str,
        request: PushTokenRequest,
    ) -> dict[str, Any]:
        row = {"user_id": user_id, "token": request.token}
        self.push_tokens.append(row)
        return row

    def list_push_tokens(self, user_id: str) -> list[dict[str, Any]]:
        return [row for row in self.push_tokens if row["user_id"] == user_id]

    def unregister_push_token(self, user_id: str, token: str) -> None:
        self.push_tokens = [
            row
            for row in self.push_tokens
            if not (row["user_id"] == user_id and row["token"] == token)
        ]

    def record_delivery_attempt(self, **kwargs: Any) -> Any:
        self.attempts.append(kwargs)
        return kwargs


class FakeEmailDelivery:
    provider = "fake-email"

    def send(self, *, target: str | None, notification: Notification) -> dict[str, Any]:
        return {"target": target, "notificationId": notification.id}


class FakePushDelivery:
    provider = "fake-push"

    def send(self, *, token: str, notification: Notification) -> dict[str, Any]:
        return {"token": token, "notificationId": notification.id}


def make_service(repository: FakeNotificationsRepository) -> NotificationsService:
    return NotificationsService(
        repository=repository,  # type: ignore[arg-type]
        email_delivery=FakeEmailDelivery(),  # type: ignore[arg-type]
        push_delivery=FakePushDelivery(),  # type: ignore[arg-type]
    )


def make_action(
    user_id: str,
    action_name: str,
    platform: str = "web",
) -> Action:
    return Action.model_validate(
        {
            "id": f"action-{action_name}",
            "user_id": user_id,
            "action_name": action_name,
            "platform": platform,
            "metadata": {},
            "unique_key": f"{platform}:{action_name}",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )


def test_create_notification_records_email_and_push_attempts() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    service.register_push_token("user-1", PushTokenRequest(token="ExponentPushToken[abc]"))

    notification = service.create_notification(
        "user-1",
        CreateNotificationRequest(
            group_key="auth",
            title="Login",
            body="You signed in.",
            channels={"in_app": True, "email": True, "push": True},
        ),
        email="user@example.com",
    )

    assert notification.group_key == "auth"
    assert [attempt["channel"] for attempt in repository.attempts] == ["email", "push"]
    assert all(attempt["status"] == "sent" for attempt in repository.attempts)


def test_user_preferences_disable_delivery_channels() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    service.register_push_token("user-1", PushTokenRequest(token="ExponentPushToken[abc]"))
    service.update_preference(
        "user-1",
        "auth",
        NotificationPreferencePatch(email_enabled=False, push_enabled=False),
    )

    service.create_notification(
        "user-1",
        CreateNotificationRequest(
            group_key="auth",
            title="Login",
            body="You signed in.",
            channels={"in_app": True, "email": True, "push": True},
        ),
        email="user@example.com",
    )

    assert repository.attempts == []


def test_create_notification_rejects_unknown_in_app_destination() -> None:
    with pytest.raises(ValidationError, match="Unknown app destination target"):
        CreateNotificationRequest(
            group_key="account",
            title="Broken",
            body="Broken",
            target=app_destination_target("missing"),
        )


def test_create_notification_rejects_relative_external_url() -> None:
    with pytest.raises(ValidationError):
        external_url_target("/relative")


def test_create_notification_accepts_external_url_target() -> None:
    notification = CreateNotificationRequest(
        group_key="account",
        title="Docs",
        body="Open the docs.",
        target=external_url_target("https://example.com/docs"),
    )

    assert notification.target is not None
    assert notification.target.type == "external_url"
    assert str(notification.target.target).rstrip("/") == "https://example.com/docs"


def test_create_and_list_notification_with_external_url_target() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)

    created = service.create_notification(
        "user-1",
        CreateNotificationRequest(
            group_key="account",
            title="Docs",
            body="Open the docs.",
            target=external_url_target("https://example.com/docs"),
            unique_key="demo:external:docs",
        ),
    )

    service.list_notifications("user-1")
    listed_external = repository.find_notification_by_unique_key(
        "user-1",
        "demo:external:docs",
    )

    assert created.target is not None
    assert created.target.type == "external_url"
    assert str(created.target.target).rstrip("/") == "https://example.com/docs"
    assert "href" not in created.model_dump()
    assert listed_external is not None
    assert listed_external.target is not None
    assert listed_external.target.type == "external_url"
    assert str(listed_external.target.target).rstrip("/") == "https://example.com/docs"
    assert "href" not in listed_external.model_dump()


def test_list_notifications_creates_default_view_account_notification() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)

    notifications = service.list_notifications("user-1")

    view_account = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert view_account is not None
    assert view_account.read_at is None
    assert view_account.target is not None
    assert view_account.target.type == "app_destination"
    assert view_account.target.target == "account"
    assert "href" not in view_account.model_dump()
    assert notifications == [view_account]


def test_account_viewed_action_marks_view_account_notification_read() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    login_action = Action.model_validate(
        {
            "id": "action-1",
            "user_id": "user-1",
            "action_name": "logged_in",
            "platform": "web",
            "metadata": {},
            "unique_key": "web:logged_in",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )
    service.consume_action(login_action, email="user@example.com")

    view_account = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert view_account is not None
    assert view_account.platform is None
    assert view_account.read_at is None

    service.consume_action(
        login_action.model_copy(
            update={
                "id": "action-2",
                "action_name": "account_viewed",
                "platform": "native",
            }
        ),
        email="user@example.com",
    )

    updated = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert updated is not None
    assert updated.read_at is not None


def test_account_viewed_before_listing_creates_and_reads_view_account_notification() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    action = Action.model_validate(
        {
            "id": "action-1",
            "user_id": "user-1",
            "action_name": "account_viewed",
            "platform": "web",
            "metadata": {},
            "unique_key": "web:account_viewed",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_action(action)

    view_account = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert view_account is not None
    assert view_account.read_at is not None


def test_action_marks_matching_auto_read_notification_read() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    notification = service.create_notification(
        "user-1",
        CreateNotificationRequest(
            group_key="account",
            type="demo_action",
            title="Visit account",
            body="Open account to complete this notification.",
            metadata={
                "autoReadOnly": True,
                "autoReadActionName": "account_visited",
            },
            unique_key="demo:generated:action",
        ),
    )

    assert notification.read_at is None

    service.consume_action(make_action("user-1", "account_visited"))

    updated = repository.find_notification_by_unique_key(
        "user-1",
        "demo:generated:action",
    )
    assert updated is not None
    assert updated.read_at is not None


def test_action_does_not_mark_non_matching_auto_read_notification() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    service.create_notification(
        "user-1",
        CreateNotificationRequest(
            group_key="account",
            type="demo_action",
            title="Visit account",
            body="Open account to complete this notification.",
            metadata={
                "autoReadOnly": True,
                "autoReadActionName": "account_visited",
            },
            unique_key="demo:generated:action",
        ),
    )

    service.consume_action(make_action("user-1", "profile_viewed"))

    updated = repository.find_notification_by_unique_key(
        "user-1",
        "demo:generated:action",
    )
    assert updated is not None
    assert updated.read_at is None


def test_login_action_creates_prompt_for_other_platform_only() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    action = Action.model_validate(
        {
            "id": "action-1",
            "user_id": "user-1",
            "action_name": "logged_in",
            "platform": "native",
            "metadata": {},
            "unique_key": "native:logged_in",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_action(action, email="user@example.com")

    assert repository.find_notification_by_unique_key("user-1", "demo:login:native") is None
    web_prompt = repository.find_notification_by_unique_key("user-1", "demo:login:web")
    assert web_prompt is not None
    assert web_prompt.platform == "web"
    assert web_prompt.metadata["autoReadOnly"] is True
    assert web_prompt.target is None


def test_signup_action_creates_prompt_for_other_platform() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    action = Action.model_validate(
        {
            "id": "action-1",
            "user_id": "user-1",
            "action_name": "signed_up",
            "platform": "native",
            "metadata": {},
            "unique_key": "native:signed_up",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_action(action, email="user@example.com")

    assert repository.find_notification_by_unique_key("user-1", "demo:login:native") is None
    web_prompt = repository.find_notification_by_unique_key("user-1", "demo:login:web")
    assert web_prompt is not None
    assert web_prompt.platform == "web"
    assert web_prompt.target is None


def test_login_prompt_is_read_only_until_target_platform_login() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    service.consume_action(
        Action.model_validate(
            {
                "id": "action-1",
                "user_id": "user-1",
                "action_name": "logged_in",
                "platform": "native",
                "metadata": {},
                "unique_key": "native:logged_in",
                "occurred_at": datetime.now(UTC),
                "created_at": datetime.now(UTC),
            }
        ),
        email="user@example.com",
    )
    web_prompt = repository.find_notification_by_unique_key("user-1", "demo:login:web")
    assert web_prompt is not None

    service.mark_notification_read("user-1", web_prompt.id)
    assert repository.find_notification_by_unique_key("user-1", "demo:login:web").read_at is None  # type: ignore[union-attr]

    service.consume_action(
        Action.model_validate(
            {
                "id": "action-2",
                "user_id": "user-1",
                "action_name": "logged_in",
                "platform": "web",
                "metadata": {},
                "unique_key": "web:logged_in",
                "occurred_at": datetime.now(UTC),
                "created_at": datetime.now(UTC),
            }
        ),
        email="user@example.com",
    )

    assert repository.find_notification_by_unique_key("user-1", "demo:login:web").read_at is not None  # type: ignore[union-attr]


def test_action_service_calls_consumers_without_notification_import() -> None:
    class FakeActionRepository:
        def insert_action(self, user_id: str, action: TrackActionRequest) -> Action:
            return Action.model_validate(
                {
                    "id": "action-1",
                    "user_id": user_id,
                    "action_name": action.action_name,
                    "platform": action.platform,
                    "metadata": action.metadata,
                    "unique_key": action.unique_key,
                    "occurred_at": datetime.now(UTC),
                    "created_at": datetime.now(UTC),
                }
            )

        def list_recent_actions(self, user_id: str, limit: int = 5) -> list[Action]:
            return []

    calls = []

    def consumer(action: Action, *, email: str | None = None) -> None:
        calls.append((action.action_name, email))

    service = ActionsService(
        repository=FakeActionRepository(),  # type: ignore[arg-type]
        consumers=[consumer],
    )

    service.track_action(
        "user-1",
        TrackActionRequest(action_name="logged_in", platform="native"),
        email="user@example.com",
    )

    assert calls == [("logged_in", "user@example.com")]
