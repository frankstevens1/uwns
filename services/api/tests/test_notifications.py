from datetime import UTC, datetime
from typing import Any

from app.services.activity.models import ActivityEvent, TrackEventRequest
from app.services.activity.service import ActivityService
from app.services.notifications.models import (
    CreateNotificationRequest,
    Notification,
    NotificationPreference,
    NotificationPreferencePatch,
    PushTokenRequest,
)
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
                "href": request.href,
                "in_app_visible": in_app_visible,
                "metadata": request.metadata,
                "unique_key": request.unique_key,
                "source_activity_event_id": request.source_activity_event_id,
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

    def has_activity_event(
        self,
        user_id: str,
        event_name: str,
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
        self.get_or_create_preference(user_id, "auth")
        self.get_or_create_preference(user_id, "account")
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
    assert view_account.href == "/app/account"
    assert view_account.metadata["nativeHref"] == "/account"
    assert notifications == [view_account]


def test_account_viewed_activity_marks_view_account_notification_read() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    login_event = ActivityEvent.model_validate(
        {
            "id": "event-1",
            "user_id": "user-1",
            "event_name": "logged_in",
            "platform": "web",
            "metadata": {},
            "unique_key": "web:logged_in",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )
    service.consume_activity_event(login_event, email="user@example.com")

    view_account = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert view_account is not None
    assert view_account.platform is None
    assert view_account.read_at is None

    service.consume_activity_event(
        login_event.model_copy(
            update={
                "id": "event-2",
                "event_name": "account_viewed",
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
    event = ActivityEvent.model_validate(
        {
            "id": "event-1",
            "user_id": "user-1",
            "event_name": "account_viewed",
            "platform": "web",
            "metadata": {},
            "unique_key": "web:account_viewed",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_activity_event(event)

    view_account = repository.find_notification_by_unique_key(
        "user-1",
        "demo:view_account",
    )
    assert view_account is not None
    assert view_account.read_at is not None


def test_login_activity_creates_prompt_for_other_platform_only() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    event = ActivityEvent.model_validate(
        {
            "id": "event-1",
            "user_id": "user-1",
            "event_name": "logged_in",
            "platform": "native",
            "metadata": {},
            "unique_key": "native:logged_in",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_activity_event(event, email="user@example.com")

    assert repository.find_notification_by_unique_key("user-1", "demo:login:native") is None
    web_prompt = repository.find_notification_by_unique_key("user-1", "demo:login:web")
    assert web_prompt is not None
    assert web_prompt.platform == "web"
    assert web_prompt.metadata["autoReadOnly"] is True


def test_signup_activity_creates_prompt_for_other_platform() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    event = ActivityEvent.model_validate(
        {
            "id": "event-1",
            "user_id": "user-1",
            "event_name": "signed_up",
            "platform": "native",
            "metadata": {},
            "unique_key": "native:signed_up",
            "occurred_at": datetime.now(UTC),
            "created_at": datetime.now(UTC),
        }
    )

    service.consume_activity_event(event, email="user@example.com")

    assert repository.find_notification_by_unique_key("user-1", "demo:login:native") is None
    web_prompt = repository.find_notification_by_unique_key("user-1", "demo:login:web")
    assert web_prompt is not None
    assert web_prompt.platform == "web"


def test_login_prompt_is_read_only_until_target_platform_login() -> None:
    repository = FakeNotificationsRepository()
    service = make_service(repository)
    service.consume_activity_event(
        ActivityEvent.model_validate(
            {
                "id": "event-1",
                "user_id": "user-1",
                "event_name": "logged_in",
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

    service.consume_activity_event(
        ActivityEvent.model_validate(
            {
                "id": "event-2",
                "user_id": "user-1",
                "event_name": "logged_in",
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


def test_activity_service_calls_consumers_without_notification_import() -> None:
    class FakeActivityRepository:
        def insert_event(self, user_id: str, event: TrackEventRequest) -> ActivityEvent:
            return ActivityEvent.model_validate(
                {
                    "id": "event-1",
                    "user_id": user_id,
                    "event_name": event.event_name,
                    "platform": event.platform,
                    "metadata": event.metadata,
                    "unique_key": event.unique_key,
                    "occurred_at": datetime.now(UTC),
                    "created_at": datetime.now(UTC),
                }
            )

        def list_recent_events(self, user_id: str, limit: int = 5) -> list[ActivityEvent]:
            return []

    calls = []

    def consumer(event: ActivityEvent, *, email: str | None = None) -> None:
        calls.append((event.event_name, email))

    service = ActivityService(
        repository=FakeActivityRepository(),  # type: ignore[arg-type]
        consumers=[consumer],
    )

    service.track_event(
        "user-1",
        TrackEventRequest(event_name="logged_in", platform="native"),
        email="user@example.com",
    )

    assert calls == [("logged_in", "user@example.com")]
