from fastapi import APIRouter, Depends, HTTPException, status, Header, Security
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.db.session import get_db
from app.services.telemetry_service import TelemetryService
from app.models.device import Device

router = APIRouter()

class TelemetryPayload(BaseModel):
    temperature: float | None = None
    pressure: float | None = None
    vibration: float | None = None
    power_usage: float | None = None

async def verify_api_key(
    x_api_key: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> Device:
    result = await db.execute(select(Device).where(Device.api_key == x_api_key))
    device = result.scalars().first()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return device

@router.post("/ingest/{device_id}", status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    device_id: str,
    payload: TelemetryPayload,
    db: AsyncSession = Depends(get_db),
    device: Device = Depends(verify_api_key)
):
    # Ensure the API key belongs to the device_id in URL (optional, but good practice)
    if device.device_id != device_id:
         raise HTTPException(status_code=403, detail="API Key does not match Device ID")

    success = await TelemetryService.process_telemetry(db, device_id, payload.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"status": "success"}
