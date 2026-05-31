from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user
from app.services.activity.models import ActivityEvent, TrackEventRequest
from app.services.activity.service import ActivityService


router = APIRouter()


def get_activity_service() -> ActivityService:
    return ActivityService()


@router.post("", response_model=ActivityEvent)
def track_event(
    event: TrackEventRequest,
    current_user: CurrentUser = Depends(get_current_user),
    service: ActivityService = Depends(get_activity_service),
) -> ActivityEvent:
    return service.track_event(current_user.user_id, event)


@router.get("", response_model=list[ActivityEvent])
def list_recent_events(
    limit: int = Query(default=5, ge=1, le=25),
    current_user: CurrentUser = Depends(get_current_user),
    service: ActivityService = Depends(get_activity_service),
) -> list[ActivityEvent]:
    return service.list_recent_events(current_user.user_id, limit=limit)
