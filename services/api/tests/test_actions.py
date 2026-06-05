from datetime import UTC, datetime

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.auth import get_current_user
from app.services.actions.models import TrackActionRequest
from app.services.actions.service import ActionsService


class FakeRepository:
    def __init__(self) -> None:
        self.inserted = []
        self.listed = []

    def insert_action(self, user_id: str, action: TrackActionRequest):
        if action.unique_key:
            existing = self.find_action_by_unique_key(user_id, action.unique_key)
            if existing:
                return existing

        self.inserted.append((user_id, action))
        from app.services.actions.models import Action

        return Action.model_validate(
            {
                "id": "action-1",
                "user_id": user_id,
                "action_name": action.action_name,
                "platform": action.platform,
                "metadata": action.metadata,
                "unique_key": action.unique_key,
                "occurred_at": action.occurred_at or datetime.now(UTC),
                "created_at": datetime.now(UTC),
            }
        )

    def find_action_by_unique_key(self, user_id: str, unique_key: str):
        return None

    def list_recent_actions(self, user_id: str, limit: int = 5):
        self.listed.append((user_id, limit))
        from app.services.actions.models import Action

        return [
            Action.model_validate(
                {
                    "id": "action-1",
                    "user_id": user_id,
                    "action_name": "timer_stopped",
                    "platform": "native",
                    "metadata": {"durationMs": 1000},
                    "unique_key": None,
                    "occurred_at": datetime.now(UTC),
                    "created_at": datetime.now(UTC),
                }
            )
        ]


def test_missing_bearer_token_is_rejected() -> None:
    with pytest.raises(HTTPException) as exc:
        get_current_user(None)

    assert exc.value.status_code == 401


def test_user_token_verification_requires_user_id(monkeypatch) -> None:
    monkeypatch.setattr("app.auth.get_supabase_user", lambda token: {"email": "user@example.com"})

    with pytest.raises(HTTPException) as exc:
        get_current_user(
            HTTPAuthorizationCredentials(
                scheme="Bearer",
                credentials="access-token",
            )
        )

    assert exc.value.status_code == 401


def test_track_action_inserts_authenticated_user_action() -> None:
    repository = FakeRepository()
    service = ActionsService(repository=repository)  # type: ignore[arg-type]
    action = TrackActionRequest(
        action_name="logged_in",
        platform="web",
        metadata={"authMethod": "password"},
        occurred_at=datetime.now(UTC),
    )

    created = service.track_action("user-1", action)

    assert created.user_id == "user-1"
    assert created.action_name == "logged_in"
    assert created.metadata["authMethod"] == "password"
    assert repository.inserted == [("user-1", action)]


def test_unique_action_returns_existing_record() -> None:
    class ExistingRepository(FakeRepository):
        def find_action_by_unique_key(self, user_id: str, unique_key: str):
            from app.services.actions.models import Action

            return Action.model_validate(
                {
                    "id": "action-existing",
                    "user_id": user_id,
                    "action_name": "home_viewed",
                    "platform": "web",
                    "metadata": {"screen": "app_home"},
                    "unique_key": unique_key,
                    "occurred_at": datetime.now(UTC),
                    "created_at": datetime.now(UTC),
                }
            )

    repository = ExistingRepository()
    service = ActionsService(repository=repository)  # type: ignore[arg-type]
    action = TrackActionRequest(
        action_name="home_viewed",
        platform="web",
        metadata={"screen": "app_home"},
        unique_key="home_viewed",
    )

    created = service.track_action("user-1", action)

    assert created.id == "action-existing"
    assert repository.inserted == []


def test_list_recent_actions_returns_latest_user_actions() -> None:
    repository = FakeRepository()
    service = ActionsService(repository=repository)  # type: ignore[arg-type]

    actions = service.list_recent_actions("user-1", limit=5)

    assert len(actions) == 1
    assert actions[0].platform == "native"
    assert repository.listed == [("user-1", 5)]


def test_invalid_action_payload_is_rejected() -> None:
    with pytest.raises(ValidationError):
        TrackActionRequest(action_name="Logged In", platform="web")
