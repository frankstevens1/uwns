from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import CurrentUser, get_current_user
from app.services.notifications.models import (
    CreateNotificationRequest,
    Notification,
    NotificationPreference,
    NotificationPreferencePatch,
    PushTokenRequest,
)
from app.services.notifications.service import NotificationsService


router = APIRouter()


def get_notifications_service() -> NotificationsService:
    return NotificationsService()


@router.post("", response_model=Notification)
def create_notification(
    request: CreateNotificationRequest,
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> Notification:
    return service.create_notification(
        current_user.user_id,
        request,
        email=current_user.email,
    )


@router.get("", response_model=list[Notification])
def list_notifications(
    limit: int = Query(default=25, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> list[Notification]:
    return service.list_notifications(current_user.user_id, limit=limit)


@router.post("/{notification_id}/read", response_model=Notification)
def mark_notification_read(
    notification_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> Notification:
    notification = service.mark_notification_read(current_user.user_id, notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notification


@router.post("/read-all", response_model=list[Notification])
def mark_all_notifications_read(
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> list[Notification]:
    return service.mark_all_notifications_read(current_user.user_id)


@router.get("/preferences", response_model=list[NotificationPreference])
def list_preferences(
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> list[NotificationPreference]:
    return service.list_preferences(current_user.user_id)


@router.patch("/preferences/{group_key}", response_model=NotificationPreference)
def update_preference(
    group_key: str,
    patch: NotificationPreferencePatch,
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> NotificationPreference:
    return service.update_preference(current_user.user_id, group_key, patch)


@router.post("/push-tokens", response_model=dict)
def register_push_token(
    request: PushTokenRequest,
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> dict:
    return service.register_push_token(current_user.user_id, request)


@router.delete("/push-tokens", response_model=dict[str, bool])
def unregister_push_token(
    token: str,
    current_user: CurrentUser = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> dict[str, bool]:
    service.unregister_push_token(current_user.user_id, token)
    return {"ok": True}
