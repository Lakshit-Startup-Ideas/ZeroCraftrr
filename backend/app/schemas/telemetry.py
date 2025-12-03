from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class TelemetryBase(BaseModel):
    device_id: str
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    vibration: Optional[float] = None
    power_usage: Optional[float] = None
    time: Optional[datetime] = None

class TelemetryCreate(TelemetryBase):
    pass

class Telemetry(TelemetryBase):
    class Config:
        from_attributes = True

class TelemetryAggregate(BaseModel):
    time_bucket: datetime
    avg_temperature: Optional[float] = None
    max_pressure: Optional[float] = None
