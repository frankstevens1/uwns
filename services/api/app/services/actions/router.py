from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user
from app.services.actions.models import Action, TrackActionRequest
from app.services.actions.service import ActionsService
from app.services.notifications.service import NotificationsService


router = APIRouter()


def get_actions_service() -> ActionsService:
    notifications = NotificationsService()
    return ActionsService(consumers=[notifications.consume_action])


@router.post("", response_model=Action)
def track_action(
    action: TrackActionRequest,
    current_user: CurrentUser = Depends(get_current_user),
    service: ActionsService = Depends(get_actions_service),
) -> Action:
    return service.track_action(current_user.user_id, action, email=current_user.email)


@router.get("", response_model=list[Action])
def list_recent_actions(
    limit: int = Query(default=5, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    service: ActionsService = Depends(get_actions_service),
) -> list[Action]:
    return service.list_recent_actions(current_user.user_id, limit=limit)
