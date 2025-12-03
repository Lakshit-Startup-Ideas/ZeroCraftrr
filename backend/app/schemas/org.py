from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class OrgBase(BaseModel):
    name: str

class OrgCreate(OrgBase):
    pass

class OrgUpdate(OrgBase):
    pass

class OrgInDBBase(OrgBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Org(OrgInDBBase):
    pass
