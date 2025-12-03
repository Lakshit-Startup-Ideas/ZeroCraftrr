from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class SiteBase(BaseModel):
    name: str
    organization_id: int

class SiteCreate(SiteBase):
    pass

class SiteUpdate(SiteBase):
    name: Optional[str] = None
    organization_id: Optional[int] = None

class SiteInDBBase(SiteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Site(SiteInDBBase):
    pass
