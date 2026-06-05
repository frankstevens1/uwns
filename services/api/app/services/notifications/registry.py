from functools import lru_cache
import json
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[5]
NOTIFICATION_GROUPS_PATH = PROJECT_ROOT / "packages" / "lib" / "src" / "notification-groups.json"
NOTIFICATION_DESTINATIONS_PATH = (
    PROJECT_ROOT / "packages" / "lib" / "src" / "notification-destinations.json"
)


@lru_cache(maxsize=1)
def load_notification_group_configs() -> dict[str, dict[str, Any]]:
    return _read_json_object(NOTIFICATION_GROUPS_PATH)


@lru_cache(maxsize=1)
def load_notification_destination_manifest() -> list[dict[str, Any]]:
    data = _read_json(NOTIFICATION_DESTINATIONS_PATH)
    if not isinstance(data, list):
        raise RuntimeError(
            f"Notification destination manifest must be a list: {NOTIFICATION_DESTINATIONS_PATH}"
        )
    return data


@lru_cache(maxsize=1)
def get_notification_group_keys() -> tuple[str, ...]:
    return tuple(load_notification_group_configs().keys())


@lru_cache(maxsize=1)
def get_notification_destination_ids() -> frozenset[str]:
    return frozenset(
        destination["id"]
        for destination in load_notification_destination_manifest()
        if isinstance(destination, dict) and isinstance(destination.get("id"), str)
    )


def has_notification_destination(destination_id: str) -> bool:
    return destination_id in get_notification_destination_ids()


def _read_json_object(path: Path) -> dict[str, Any]:
    data = _read_json(path)
    if not isinstance(data, dict):
        raise RuntimeError(f"Expected JSON object at {path}")
    return data


def _read_json(path: Path) -> Any:
    if not path.exists():
        raise RuntimeError(f"Missing required notification registry file: {path}")
    return json.loads(path.read_text())
