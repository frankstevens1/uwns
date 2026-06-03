from collections.abc import Callable

from app.services.activity.models import ActivityEvent, TrackEventRequest
from app.services.activity.repository import ActivityRepository

ActivityEventConsumer = Callable[[ActivityEvent], None]


class ActivityService:
    def __init__(
        self,
        repository: ActivityRepository | None = None,
        consumers: list[Callable[..., None]] | None = None,
    ) -> None:
        self.repository = repository or ActivityRepository()
        self.consumers = consumers or []

    def track_event(
        self,
        user_id: str,
        event: TrackEventRequest,
        *,
        email: str | None = None,
    ) -> ActivityEvent:
        created = self.repository.insert_event(user_id, event)
        for consumer in self.consumers:
            consumer(created, email=email)
        return created

    def list_recent_events(self, user_id: str, limit: int = 5) -> list[ActivityEvent]:
        return self.repository.list_recent_events(user_id, limit=limit)
