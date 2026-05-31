from functools import lru_cache
import os


class Settings:
    def __init__(self) -> None:
        self.supabase_url = require_env("SUPABASE_URL")
        self.supabase_secret_key = require_env("SUPABASE_SECRET_KEY")
        self.cors_origins = parse_csv_env(
            "API_CORS_ORIGINS",
            "http://127.0.0.1:3000,http://localhost:3000",
        )


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def parse_csv_env(name: str, fallback: str) -> list[str]:
    raw = os.environ.get(name, fallback)
    return [part.strip() for part in raw.split(",") if part.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
