from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    device_id: str
    severity: str
    message: str
    is_resolved: Optional[bool] = False

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    is_resolved: bool
    resolved_at: Optional[datetime] = None

class AlertInDBBase(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Alert(AlertInDBBase):
    pass
