from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)

    sites = relationship("Site", back_populates="organization", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    organization = relationship("Organization", back_populates="sites")
    devices = relationship("Device", back_populates="site", cascade="all, delete-orphan")
    forecasts = relationship("ForecastEnergy", back_populates="site", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True, nullable=False)


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_role"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    site_scope_id = Column(Integer, ForeignKey("sites.id"), nullable=True)

    role = relationship("Role")
    site_scope = relationship("Site")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Integer, default=1)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    organization = relationship("Organization")
    roles = relationship("UserRole", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="owner")


class Device(Base):
    __tablename__ = "devices"
    __table_args__ = (UniqueConstraint("identifier", name="uq_device_identifier"),)

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(Enum("energy", "waste", name="device_type"), default="energy", nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    metadata_json = Column(String(2048), nullable=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="devices")
    owner = relationship("User", back_populates="devices")
    telemetry_records = relationship("Telemetry", back_populates="device", cascade="all, delete-orphan")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metric = Column(String(64), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)

    device = relationship("Device", back_populates="telemetry_records")


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    waste_type = Column(String(64), nullable=False)
    mass_kg = Column(Numeric(10, 4), nullable=False)
    co2e_kg = Column(Numeric(10, 4), nullable=False)

    device = relationship("Device")


class ForecastEnergy(Base):
    __tablename__ = "forecast_energy"

    id = Column(Integer, primary_key=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    predicted_kwh = Column(Float, nullable=False)
    predicted_co2 = Column(Float, nullable=False)

    site = relationship("Site", back_populates="forecasts")


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True)
    metric = Column(String(64), nullable=False)
    threshold = Column(Float, nullable=False)
    window_seconds = Column(Integer, nullable=False)
    action = Column(String(64), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    status = Column(Enum("triggered", "resolved", name="alert_status"), default="triggered", nullable=False)
    message = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    period = Column(String(32), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    storage_path = Column(String(512), nullable=False)
    format = Column(String(16), nullable=False)

    site = relationship("Site")


class ModelRegistry(Base):
    __tablename__ = "models_registry"

    id = Column(Integer, primary_key=True)
    model_name = Column(String(128), nullable=False)
    version = Column(String(64), nullable=False)
    accuracy = Column(Float, nullable=True)
    path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


metadata = Base.metadata
