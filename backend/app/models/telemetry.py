from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func

from app.db.base import Base

class Telemetry(Base):
    # No primary key for hypertable usually, but SQLAlchemy needs one for mapping.
    # In Timescale, we partition by time.
    # We'll use a composite PK for SQLAlchemy's sake if needed, or just let it be.
    # For high-volume ingest, we might skip ORM for inserts, but for now define it.
    
    time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    device_id = Column(String, ForeignKey("device.device_id"), primary_key=True, nullable=False)
    
    temperature = Column(Float)
    pressure = Column(Float)
    vibration = Column(Float)
    power_usage = Column(Float)
    
    # Add other metrics as needed
