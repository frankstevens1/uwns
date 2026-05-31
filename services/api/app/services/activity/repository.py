from datetime import UTC, datetime

from app.db import SupabaseRestClient
from app.services.activity.models import ActivityEvent, TrackEventRequest


class ActivityRepository:
    def __init__(self, db: SupabaseRestClient | None = None) -> None:
        self.db = db or SupabaseRestClient()

    def insert_event(self, user_id: str, event: TrackEventRequest) -> ActivityEvent:
        if event.unique_key:
            existing = self.find_event_by_unique_key(user_id, event.unique_key)
            if existing:
                return existing

        occurred_at = event.occurred_at or datetime.now(UTC)
        rows = self.db.insert(
            "activity_events",
            [
                {
                    "user_id": user_id,
                    "event_name": event.event_name,
                    "platform": event.platform,
                    "metadata": event.metadata,
                    "unique_key": event.unique_key,
                    "occurred_at": occurred_at.isoformat(),
                }
            ],
        )
        return ActivityEvent.model_validate(rows[0])

    def find_event_by_unique_key(
        self,
        user_id: str,
        unique_key: str,
    ) -> ActivityEvent | None:
        rows = self.db.select(
            "activity_events",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "unique_key": f"eq.{unique_key}",
                "limit": "1",
            },
        )
        if not rows:
            return None
        return ActivityEvent.model_validate(rows[0])

    def list_recent_events(self, user_id: str, limit: int = 5) -> list[ActivityEvent]:
        rows = self.db.select(
            "activity_events",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "order": "occurred_at.desc",
                "limit": str(limit),
            },
        )
        return [ActivityEvent.model_validate(row) for row in rows]
