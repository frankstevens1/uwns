from collections.abc import Callable

from app.services.actions.models import Action, TrackActionRequest
from app.services.actions.repository import ActionsRepository

ActionConsumer = Callable[[Action], None]


class ActionsService:
    def __init__(
        self,
        repository: ActionsRepository | None = None,
        consumers: list[Callable[..., None]] | None = None,
    ) -> None:
        self.repository = repository or ActionsRepository()
        self.consumers = consumers or []

    def track_action(
        self,
        user_id: str,
        action: TrackActionRequest,
        *,
        email: str | None = None,
    ) -> Action:
        created = self.repository.insert_action(user_id, action)
        for consumer in self.consumers:
            consumer(created, email=email)
        return created

    def list_recent_actions(self, user_id: str, limit: int = 5) -> list[Action]:
        return self.repository.list_recent_actions(user_id, limit=limit)
