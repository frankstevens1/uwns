from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.services.activity.router import router as activity_router
from app.services.notifications.router import router as notifications_router


settings = get_settings()

app = FastAPI(title="UWNS API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(activity_router, prefix="/v1/events", tags=["events"])
app.include_router(
    notifications_router,
    prefix="/v1/notifications",
    tags=["notifications"],
)
