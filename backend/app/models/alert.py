from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Alert(Base):
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("device.device_id"), nullable=False)
    severity = Column(String, nullable=False) # INFO, WARNING, CRITICAL
    message = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
