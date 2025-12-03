from sqlalchemy.ext.asyncio import AsyncSession
from app.models.telemetry import Telemetry
from app.models.device import Device
from sqlalchemy.future import select
import logging
import json
from app.api.api_v1.endpoints.websockets import manager

logger = logging.getLogger(__name__)

class TelemetryService:
    @staticmethod
    async def process_telemetry(db: AsyncSession, device_id: str, data: dict) -> bool:
        # 1. Validate Device Exists
        result = await db.execute(select(Device).where(Device.device_id == device_id))
        device = result.scalars().first()
        
        if not device:
            logger.warning(f"Device {device_id} not found.")
            return False

        # 2. Store in TimescaleDB
        telemetry = Telemetry(
            device_id=device_id,
            temperature=data.get("temperature"),
            pressure=data.get("pressure"),
            vibration=data.get("vibration"),
            power_usage=data.get("power_usage")
        )
        db.add(telemetry)
        await db.commit()
        
        # 3. Broadcast to WebSockets
        try:
            msg = json.dumps({
                "device_id": device_id,
                "data": data,
                "timestamp": str(telemetry.time) if hasattr(telemetry, 'time') else None
            })
            await manager.broadcast(msg)
        except Exception as e:
            logger.error(f"Failed to broadcast WS message: {e}")

        return True
