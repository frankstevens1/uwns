from app.services.actions.models import Action
from app.services.notifications.delivery import EmailDelivery, ExpoPushDelivery
from app.services.notifications.builders import (
    app_destination_target,
    build_notification_request,
    notification_channels,
)
from app.services.notifications.models import (
    CreateNotificationRequest,
    Notification,
    NotificationPreference,
    NotificationPreferencePatch,
    PushTokenRequest,
)
from app.services.notifications.repository import NotificationsRepository


AUTH_ONBOARDING_ACTIONS = ("logged_in", "signed_up")
DOCS_ONBOARDING_UNIQUE_KEY = "onboarding:docs"


class NotificationsService:
    def __init__(
        self,
        repository: NotificationsRepository | None = None,
        email_delivery: EmailDelivery | None = None,
        push_delivery: ExpoPushDelivery | None = None,
    ) -> None:
        self.repository = repository or NotificationsRepository()
        self.email_delivery = email_delivery or EmailDelivery()
        self.push_delivery = push_delivery or ExpoPushDelivery()

    def create_notification(
        self,
        user_id: str,
        request: CreateNotificationRequest,
        *,
        email: str | None = None,
    ) -> Notification:
        preference = self.repository.get_or_create_preference(user_id, request.group_key)
        notification = self.repository.create_or_update_notification(
            user_id,
            request,
            in_app_visible=request.channels.in_app and preference.in_app_enabled,
        )

        if request.channels.email and preference.email_enabled:
            self._send_email(user_id, email, notification)

        if request.channels.push and preference.push_enabled:
            self._send_push(user_id, notification)

        return notification

    def list_notifications(self, user_id: str, limit: int = 25) -> list[Notification]:
        self._ensure_view_account_notification(user_id)
        return self.repository.list_notifications(user_id, limit=limit)

    def mark_notification_read(self, user_id: str, notification_id: str) -> Notification | None:
        existing = self.repository.find_notification_by_id(user_id, notification_id)
        if existing is None:
            return None
        if _is_auto_read_only(existing):
            return existing
        return self.repository.mark_notification_read(user_id, notification_id)

    def mark_all_notifications_read(self, user_id: str) -> list[Notification]:
        updated = []
        for notification in self.repository.list_notifications(user_id, limit=100):
            if notification.read_at or _is_auto_read_only(notification):
                continue
            next_notification = self.repository.mark_notification_read(
                user_id,
                notification.id,
            )
            if next_notification:
                updated.append(next_notification)
        return updated

    def list_preferences(self, user_id: str) -> list[NotificationPreference]:
        return self.repository.list_preferences(user_id)

    def update_preference(
        self,
        user_id: str,
        group_key: str,
        patch: NotificationPreferencePatch,
    ) -> NotificationPreference:
        return self.repository.update_preference(user_id, group_key, patch)

    def register_push_token(self, user_id: str, request: PushTokenRequest) -> dict:
        return self.repository.register_push_token(user_id, request)

    def unregister_push_token(self, user_id: str, token: str) -> None:
        self.repository.unregister_push_token(user_id, token)

    def consume_action(
        self,
        action: Action,
        *,
        email: str | None = None,
    ) -> None:
        self.repository.mark_notifications_read_by_auto_read_action(
            action.user_id,
            action.action_name,
        )

        if action.action_name in AUTH_ONBOARDING_ACTIONS:
            self._ensure_docs_onboarding_notification(action)
            self._handle_platform_authenticated(action, email=email)
            return

        if action.action_name == "account_viewed":
            self._handle_account_viewed(action)

    def _handle_platform_authenticated(
        self,
        action: Action,
        *,
        email: str | None,
    ) -> None:
        if action.action_name == "logged_in":
            self.repository.mark_notification_read_by_unique_key(
                action.user_id,
                f"demo:login:{action.platform}",
            )

        other_platform = "native" if action.platform == "web" else "web"
        other_platform_seen = self.repository.has_action(
            action.user_id,
            "logged_in",
            other_platform,
        ) or self.repository.has_action(
            action.user_id,
            "signed_up",
            other_platform,
        )
        if not other_platform_seen:
            platform_label = "web" if other_platform == "web" else "native"
            self.create_notification(
                action.user_id,
                build_notification_request(
                    group_key="auth",
                    type="login_platform_prompt",
                    title=f"Log in on {platform_label}",
                    body=f"Complete the demo by signing in on {platform_label}.",
                    platform=other_platform,
                    metadata={
                        "actionName": action.action_name,
                        "autoReadOnly": True,
                        "targetPlatform": other_platform,
                    },
                    unique_key=f"demo:login:{other_platform}",
                    source_action_id=action.id,
                    channels=notification_channels(email=True, push=True),
                ),
                email=email,
            )
        self._ensure_view_account_notification(
            action.user_id,
            source_action_id=action.id,
            action_name=action.action_name,
        )

    def _ensure_docs_onboarding_notification(self, action: Action) -> Notification | None:
        existing = self.repository.find_notification_by_unique_key(
            action.user_id,
            DOCS_ONBOARDING_UNIQUE_KEY,
        )
        if existing is not None:
            return existing

        if self.repository.has_any_action(
            action.user_id,
            AUTH_ONBOARDING_ACTIONS,
            exclude_action_id=action.id,
        ):
            return None

        if self.repository.has_any_action(action.user_id, ("docs_viewed",)):
            return None

        preference = self.repository.get_or_create_preference(action.user_id, "docs")
        return self.repository.create_notification_if_missing(
            action.user_id,
            build_notification_request(
                group_key="docs",
                type="onboarding",
                title="Read the docs",
                body="Open the documentation to learn how the product is structured.",
                platform=None,
                target=app_destination_target("docs"),
                metadata={"autoReadActionName": "docs_viewed"},
                unique_key=DOCS_ONBOARDING_UNIQUE_KEY,
                source_action_id=action.id,
                channels=notification_channels(),
            ),
            in_app_visible=preference.in_app_enabled,
        )

    def _handle_account_viewed(self, action: Action) -> None:
        self._ensure_view_account_notification(
            action.user_id,
            source_action_id=action.id,
            action_name=action.action_name,
        )
        self.repository.mark_notification_read_by_unique_key(
            action.user_id,
            "demo:view_account",
        )

    def _ensure_view_account_notification(
        self,
        user_id: str,
        *,
        source_action_id: str | None = None,
        action_name: str | None = None,
    ) -> Notification:
        existing = self.repository.find_notification_by_unique_key(
            user_id,
            "demo:view_account",
        )
        if (
            existing
            and existing.target is not None
            and existing.target.type == "app_destination"
            and existing.target.target == "account"
        ):
            return existing

        preference = self.repository.get_or_create_preference(user_id, "account")
        return self.repository.create_or_update_notification(
            user_id,
            build_notification_request(
                group_key="account",
                type="view_account",
                title="View Account",
                body="Open your account screen to confirm the account action flow.",
                platform=None,
                target=app_destination_target("account"),
                metadata={
                    "actionName": action_name,
                },
                unique_key="demo:view_account",
                source_action_id=source_action_id,
                channels=notification_channels(),
            ),
            in_app_visible=preference.in_app_enabled,
            reset_read=False,
        )

    def _send_email(
        self,
        user_id: str,
        target: str | None,
        notification: Notification,
    ) -> None:
        if not target:
            self.repository.record_delivery_attempt(
                user_id=user_id,
                notification_id=notification.id,
                channel="email",
                status="skipped",
                provider=self.email_delivery.provider,
                error="User email is unavailable",
            )
            return

        try:
            response = self.email_delivery.send(target=target, notification=notification)
            self.repository.record_delivery_attempt(
                user_id=user_id,
                notification_id=notification.id,
                channel="email",
                status="sent",
                provider=self.email_delivery.provider,
                target=target,
                response=response,
            )
        except Exception as exc:
            self.repository.record_delivery_attempt(
                user_id=user_id,
                notification_id=notification.id,
                channel="email",
                status="failed",
                provider=self.email_delivery.provider,
                target=target,
                error=str(exc),
            )

    def _send_push(self, user_id: str, notification: Notification) -> None:
        tokens = self.repository.list_push_tokens(user_id)
        if not tokens:
            self.repository.record_delivery_attempt(
                user_id=user_id,
                notification_id=notification.id,
                channel="push",
                status="skipped",
                provider=self.push_delivery.provider,
                error="No registered push tokens",
            )
            return

        for token_row in tokens:
            token = token_row.get("token")
            if not isinstance(token, str):
                continue

            try:
                response = self.push_delivery.send(token=token, notification=notification)
                self.repository.record_delivery_attempt(
                    user_id=user_id,
                    notification_id=notification.id,
                    channel="push",
                    status="sent",
                    provider=self.push_delivery.provider,
                    target=token,
                    response=response,
                )
            except Exception as exc:
                self.repository.record_delivery_attempt(
                    user_id=user_id,
                    notification_id=notification.id,
                    channel="push",
                    status="failed",
                    provider=self.push_delivery.provider,
                    target=token,
                    error=str(exc),
                )


def _is_auto_read_only(notification: Notification) -> bool:
    return notification.metadata.get("autoReadOnly") is True
