from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str
    exp: datetime


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    organization_id: Optional[int] = None
    role: Optional[str] = None
    site_scope_id: Optional[int] = None


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class OrganizationBase(BaseModel):
    name: str


class OrganizationCreate(OrganizationBase):
    pass


class Organization(OrganizationBase):
    id: int

    class Config:
        from_attributes = True


class SiteBase(BaseModel):
    name: str
    location: Optional[str] = None
    org_id: int


class SiteCreate(SiteBase):
    pass


class Site(SiteBase):
    id: int

    class Config:
        from_attributes = True


class FactoryBase(BaseModel):
    name: str
    location: Optional[str] = None


class FactoryCreate(FactoryBase):
    pass


class Factory(FactoryBase):
    id: int

    class Config:
        from_attributes = True


class DeviceBase(BaseModel):
    identifier: str
    name: str
    type: str = Field(pattern="^(energy|waste)$")
    site_id: int = Field(..., validation_alias="factory_id", serialization_alias="factory_id")
    metadata_json: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class DeviceCreate(DeviceBase):
    owner_id: Optional[int] = None


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    metadata_json: Optional[str] = None


class Device(DeviceBase):
    id: int
    last_seen_at: datetime

    class Config:
        from_attributes = True


class TelemetryCreate(BaseModel):
    device_identifier: str
    timestamp: datetime
    metric: str
    value: float
    unit: str


class TelemetryResponse(BaseModel):
    device_id: int
    timestamp: datetime
    metric: str
    value: float
    unit: str

    class Config:
        from_attributes = True


class AggregatedMetrics(BaseModel):
    total_energy_kwh: float
    total_co2_kg: float
    total_waste_kg: float
    total_waste_co2_kg: float


class ForecastPoint(BaseModel):
    timestamp: datetime
    predicted_kwh: float
    predicted_co2: float


class ForecastResponse(BaseModel):
    site_id: int
    points: List[ForecastPoint]


class AlertRuleBase(BaseModel):
    metric: str
    threshold: float
    window_seconds: int
    action: str
    site_id: Optional[int] = None
    organization_id: Optional[int] = None


class AlertRuleCreate(AlertRuleBase):
    pass


class AlertRule(AlertRuleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AlertHistoryRecord(BaseModel):
    id: int
    rule_id: int
    site_id: Optional[int]
    status: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportRecord(BaseModel):
    id: int
    site_id: int
    period: str
    generated_at: datetime
    storage_path: str
    format: str

    class Config:
        from_attributes = True


class Role(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserRole(BaseModel):
    role_id: int
    site_scope_id: Optional[int]


class UserWithRoles(User):
    roles: List[UserRole]


class AlertResponse(BaseModel):
    device_id: int
    message: str
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True
