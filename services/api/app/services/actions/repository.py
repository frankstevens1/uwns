from datetime import UTC, datetime

from app.db import SupabaseRestClient
from app.services.actions.models import Action, TrackActionRequest


class ActionsRepository:
    def __init__(self, db: SupabaseRestClient | None = None) -> None:
        self.db = db or SupabaseRestClient()

    def insert_action(self, user_id: str, action: TrackActionRequest) -> Action:
        if action.unique_key:
            existing = self.find_action_by_unique_key(user_id, action.unique_key)
            if existing:
                return existing

        occurred_at = action.occurred_at or datetime.now(UTC)
        rows = self.db.insert(
            "actions",
            [
                {
                    "user_id": user_id,
                    "action_name": action.action_name,
                    "platform": action.platform,
                    "metadata": action.metadata,
                    "unique_key": action.unique_key,
                    "occurred_at": occurred_at.isoformat(),
                }
            ],
        )
        return Action.model_validate(rows[0])

    def find_action_by_unique_key(
        self,
        user_id: str,
        unique_key: str,
    ) -> Action | None:
        rows = self.db.select(
            "actions",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "unique_key": f"eq.{unique_key}",
                "limit": "1",
            },
        )
        if not rows:
            return None
        return Action.model_validate(rows[0])

    def list_recent_actions(self, user_id: str, limit: int = 5) -> list[Action]:
        rows = self.db.select(
            "actions",
            {
                "select": "*",
                "user_id": f"eq.{user_id}",
                "order": "occurred_at.desc",
                "limit": str(limit),
            },
        )
        return [Action.model_validate(row) for row in rows]
