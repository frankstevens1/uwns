from datetime import UTC, datetime

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.auth import get_current_user
from app.services.activity.models import TrackEventRequest
from app.services.activity.service import ActivityService


class FakeRepository:
    def __init__(self) -> None:
        self.inserted = []
        self.listed = []

    def insert_event(self, user_id: str, event: TrackEventRequest):
        if event.unique_key:
            existing = self.find_event_by_unique_key(user_id, event.unique_key)
            if existing:
                return existing

        self.inserted.append((user_id, event))
        from app.services.activity.models import ActivityEvent

        return ActivityEvent.model_validate(
            {
                "id": "event-1",
                "user_id": user_id,
                "event_name": event.event_name,
                "platform": event.platform,
                "metadata": event.metadata,
                "unique_key": event.unique_key,
                "occurred_at": event.occurred_at or datetime.now(UTC),
                "created_at": datetime.now(UTC),
            }
        )

    def find_event_by_unique_key(self, user_id: str, unique_key: str):
        return None

    def list_recent_events(self, user_id: str, limit: int = 5):
        self.listed.append((user_id, limit))
        from app.services.activity.models import ActivityEvent

        return [
            ActivityEvent.model_validate(
                {
                    "id": "event-1",
                    "user_id": user_id,
                    "event_name": "timer_stopped",
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


def test_track_event_inserts_authenticated_user_event() -> None:
    repository = FakeRepository()
    service = ActivityService(repository=repository)  # type: ignore[arg-type]
    event = TrackEventRequest(
        event_name="logged_in",
        platform="web",
        metadata={"authMethod": "password"},
        occurred_at=datetime.now(UTC),
    )

    created = service.track_event("user-1", event)

    assert created.user_id == "user-1"
    assert created.event_name == "logged_in"
    assert created.metadata["authMethod"] == "password"
    assert repository.inserted == [("user-1", event)]


def test_unique_event_returns_existing_record() -> None:
    class ExistingRepository(FakeRepository):
        def find_event_by_unique_key(self, user_id: str, unique_key: str):
            from app.services.activity.models import ActivityEvent

            return ActivityEvent.model_validate(
                {
                    "id": "event-existing",
                    "user_id": user_id,
                    "event_name": "home_viewed",
                    "platform": "web",
                    "metadata": {"screen": "app_home"},
                    "unique_key": unique_key,
                    "occurred_at": datetime.now(UTC),
                    "created_at": datetime.now(UTC),
                }
            )

    repository = ExistingRepository()
    service = ActivityService(repository=repository)  # type: ignore[arg-type]
    event = TrackEventRequest(
        event_name="home_viewed",
        platform="web",
        metadata={"screen": "app_home"},
        unique_key="home_viewed",
    )

    created = service.track_event("user-1", event)

    assert created.id == "event-existing"
    assert repository.inserted == []


def test_list_recent_events_returns_latest_user_events() -> None:
    repository = FakeRepository()
    service = ActivityService(repository=repository)  # type: ignore[arg-type]

    events = service.list_recent_events("user-1", limit=5)

    assert len(events) == 1
    assert events[0].platform == "native"
    assert repository.listed == [("user-1", 5)]


def test_invalid_event_payload_is_rejected() -> None:
    with pytest.raises(ValidationError):
        TrackEventRequest(event_name="Logged In", platform="web")
