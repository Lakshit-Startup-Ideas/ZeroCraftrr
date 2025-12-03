from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.services.telemetry_service import TelemetryService

router = APIRouter()

class TelemetryPayload(BaseModel):
    temperature: float | None = None
    pressure: float | None = None
    vibration: float | None = None
    power_usage: float | None = None

@router.post("/ingest/{device_id}", status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    device_id: str,
    payload: TelemetryPayload,
    db: AsyncSession = Depends(get_db)
):
    success = await TelemetryService.process_telemetry(db, device_id, payload.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"status": "success"}
