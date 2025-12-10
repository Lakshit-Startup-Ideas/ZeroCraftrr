from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select

from app.api import deps
from app.db.session import get_db
from app.models.device import Device
from app.schemas.device import Device as DeviceSchema, DeviceCreate

router = APIRouter()

@router.get("/", response_model=List[DeviceSchema])
async def read_devices(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by device name or id"),
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    query = select(Device)
    if search:
        like_pattern = f"%{search}%"
        query = query.where(or_(Device.name.ilike(like_pattern), Device.device_id.ilike(like_pattern)))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
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
