from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, orgs, sites, devices, telemetry, alerts, websockets

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orgs.router, prefix="/orgs", tags=["orgs"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(websockets.router, tags=["websockets"])

@api_router.get("/health")
def health_check():
    return {"status": "ok"}
