from sqlalchemy.ext.asyncio import AsyncSession
from app.models.telemetry import Telemetry
from app.models.device import Device
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

class TelemetryService:
    @staticmethod
    async def process_telemetry(db: AsyncSession, device_id: str, data: dict):
        # 1. Validate Device Exists
        result = await db.execute(select(Device).where(Device.device_id == device_id))
        device = result.scalars().first()
        
        if not device:
            logger.warning(f"Received telemetry for unknown device: {device_id}")
            return False

        # 2. Create Telemetry Record
        telemetry = Telemetry(
            device_id=device_id,
            temperature=data.get("temperature"),
            pressure=data.get("pressure"),
            vibration=data.get("vibration"),
            power_usage=data.get("power_usage")
        )
        
        # 3. Save to TimescaleDB
        db.add(telemetry)
        await db.commit()
        return True
