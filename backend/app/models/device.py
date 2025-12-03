from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import secrets

from app.db.base import Base

class Device(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    device_id = Column(String, unique=True, index=True, nullable=False) # Hardware ID / MQTT Client ID
    api_key = Column(String, unique=True, index=True, default=lambda: secrets.token_urlsafe(32))
    site_id = Column(Integer, ForeignKey("site.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    site = relationship("Site", back_populates="devices")
