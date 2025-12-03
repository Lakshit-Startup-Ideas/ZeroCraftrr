from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.db.session import get_db
from app.models.alert import Alert
from app.schemas.alert import Alert as AlertSchema, AlertCreate, AlertUpdate

router = APIRouter()

@router.get("/", response_model=List[AlertSchema])
async def read_alerts(
    skip: int = 0,
    limit: int = 100,
    resolved: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    query = select(Alert).where(Alert.is_resolved == resolved).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=AlertSchema)
async def create_alert(
    *,
    db: AsyncSession = Depends(get_db),
    alert_in: AlertCreate,
    # Allow internal services or admins to create alerts
    # current_user: Any = Depends(deps.get_current_active_user), 
) -> Any:
    alert = Alert(
        device_id=alert_in.device_id,
        severity=alert_in.severity,
        message=alert_in.message,
        is_resolved=alert_in.is_resolved
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert

@router.put("/{alert_id}", response_model=AlertSchema)
async def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.is_resolved = alert_in.is_resolved
    if alert_in.is_resolved and not alert.resolved_at:
        alert.resolved_at = datetime.utcnow()
        
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert
