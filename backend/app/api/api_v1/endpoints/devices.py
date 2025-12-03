from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.db.session import get_db
from app.models.device import Device
from app.schemas.device import Device as DeviceSchema, DeviceCreate

router = APIRouter()

@router.get("/", response_model=List[DeviceSchema])
async def read_devices(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Device).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=DeviceSchema)
async def create_device(
    *,
    db: AsyncSession = Depends(get_db),
    device_in: DeviceCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    device = Device(
        name=device_in.name,
        device_id=device_in.device_id,
        site_id=device_in.site_id,
        is_active=device_in.is_active
    )
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device
