from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class DeviceBase(BaseModel):
    name: str
    device_id: str
    site_id: int
    is_active: Optional[bool] = True

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(DeviceBase):
    name: Optional[str] = None
    site_id: Optional[int] = None
    is_active: Optional[bool] = None

class DeviceInDBBase(DeviceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Device(DeviceInDBBase):
    pass
