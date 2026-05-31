from app.services.activity.models import ActivityEvent, TrackEventRequest
from app.services.activity.repository import ActivityRepository


class ActivityService:
    def __init__(self, repository: ActivityRepository | None = None) -> None:
        self.repository = repository or ActivityRepository()

    def track_event(self, user_id: str, event: TrackEventRequest) -> ActivityEvent:
        return self.repository.insert_event(user_id, event)

    def list_recent_events(self, user_id: str, limit: int = 5) -> list[ActivityEvent]:
        return self.repository.list_recent_events(user_id, limit=limit)
