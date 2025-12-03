from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.api import deps
from app.db.session import get_db
from app.models.telemetry import Telemetry
from app.schemas.telemetry import Telemetry as TelemetrySchema, TelemetryAggregate

router = APIRouter()

@router.get("/", response_model=List[TelemetrySchema])
async def read_telemetry(
    device_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    query = select(Telemetry).where(Telemetry.device_id == device_id)
    
    if start_time:
        query = query.where(Telemetry.time >= start_time)
    if end_time:
        query = query.where(Telemetry.time <= end_time)
        
    query = query.order_by(Telemetry.time.desc()).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/aggregate", response_model=List[TelemetryAggregate])
async def read_telemetry_aggregate(
    device_id: str,
    bucket_width: str = Query("1 hour", description="Time bucket width (e.g., '1 hour', '1 day')"),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    # Use TimescaleDB's time_bucket function
    # Note: This requires raw SQL or careful SQLAlchemy construction
    
    # Sanitize bucket_width to prevent SQL injection (basic check)
    allowed_buckets = ["1 minute", "5 minutes", "15 minutes", "1 hour", "1 day"]
    if bucket_width not in allowed_buckets:
        raise HTTPException(status_code=400, detail="Invalid bucket width")

    stmt = text(f"""
        SELECT 
            time_bucket(:bucket, time) AS time_bucket,
            AVG(temperature) as avg_temperature,
            MAX(pressure) as max_pressure
        FROM telemetry
        WHERE device_id = :device_id
        AND time >= :start
        AND time <= :end
        GROUP BY time_bucket
        ORDER BY time_bucket DESC
    """)
    
    result = await db.execute(stmt, {
        "bucket": bucket_width,
        "device_id": device_id,
        "start": start_time or datetime.min,
        "end": end_time or datetime.max
    })
    
    return result.fetchall()
