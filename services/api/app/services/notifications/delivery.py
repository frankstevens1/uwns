from typing import Any

import requests

from app.services.notifications.models import Notification


class EmailDelivery:
    provider = "dev-log-email"

    def send(self, *, target: str | None, notification: Notification) -> dict[str, Any]:
        print(
            "[Notifications] email delivery",
            {
                "target": target,
                "notification_id": notification.id,
                "title": notification.title,
                "body": notification.body,
            },
        )
        return {"mode": "dev-log"}


class ExpoPushDelivery:
    provider = "expo"

    def send(self, *, token: str, notification: Notification) -> dict[str, Any]:
        response = requests.post(
            "https://exp.host/--/api/v2/push/send",
            headers={"Content-Type": "application/json"},
            json={
                "to": token,
                "title": notification.title,
                "body": notification.body,
                "data": {
                    "notificationId": notification.id,
                    "groupKey": notification.group_key,
                    "target": (
                        notification.target.model_dump(mode="json")
                        if notification.target
                        else None
                    ),
                },
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, dict) else {"response": data}
