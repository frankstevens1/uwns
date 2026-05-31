from typing import Any

import requests
from fastapi import HTTPException, status

from app.config import get_settings


class SupabaseRestClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = f"{settings.supabase_url.rstrip('/')}/rest/v1"
        self.headers = {
            "apikey": settings.supabase_secret_key,
            "Authorization": f"Bearer {settings.supabase_secret_key}",
            "Content-Type": "application/json",
        }

    def select(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        response = requests.get(
            f"{self.base_url}/{table}",
            headers=self.headers,
            params=params,
            timeout=10,
        )
        return self._json_list(response)

    def insert(self, table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not rows:
            return []

        response = requests.post(
            f"{self.base_url}/{table}",
            headers={**self.headers, "Prefer": "return=representation"},
            json=rows,
            timeout=10,
        )
        return self._json_list(response)

    def patch(
        self,
        table: str,
        params: dict[str, str],
        values: dict[str, Any],
    ) -> list[dict[str, Any]]:
        response = requests.patch(
            f"{self.base_url}/{table}",
            headers={**self.headers, "Prefer": "return=representation"},
            params=params,
            json=values,
            timeout=10,
        )
        return self._json_list(response)

    def _json_list(self, response: requests.Response) -> list[dict[str, Any]]:
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Supabase request failed: {response.text}",
            )

        data = response.json()
        if not isinstance(data, list):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Supabase returned an unexpected response shape",
            )
        return data
