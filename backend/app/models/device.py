from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Device(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    device_id = Column(String, unique=True, index=True, nullable=False) # Hardware ID / MQTT Client ID
    site_id = Column(Integer, ForeignKey("site.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    site = relationship("Site", back_populates="devices")
