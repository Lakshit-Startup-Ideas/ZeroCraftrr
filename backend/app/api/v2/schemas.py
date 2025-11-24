from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TelemetryPoint(BaseModel):
    timestamp: datetime
    energy_kwh: float = Field(..., gt=0)


class ForecastCombinedRequest(BaseModel):
    site_id: int
    horizon_hours: int = Field(24, ge=1, le=168)
    lookback_hours: int = Field(24 * 7, ge=24, le=24 * 30)
    telemetry: Optional[List[TelemetryPoint]] = None


class ForecastComponent(BaseModel):
    timestamp: datetime
    prediction: float
    lower: float
    upper: float
    components: Dict[str, float]


class ForecastCombinedResponse(BaseModel):
    site_id: int
    horizon_hours: int
    points: List[ForecastComponent]
    metrics: Dict[str, float]
    recent_actuals: List[TelemetryPoint]


class EquipmentConfigPayload(BaseModel):
    name: str
    load_pct: float = Field(..., gt=0)
    runtime_hours: float = Field(..., gt=0)
    idle_hours: float = Field(..., ge=0)


class OptimizationRequest(BaseModel):
    site_id: int
    lambda_weight: float = Field(0.5, ge=0)
    equipment: List[EquipmentConfigPayload]


class OptimizationResponse(BaseModel):
    site_id: int
    objective: float
    baseline_objective: float
    savings_pct: float
    recommended: List[EquipmentConfigPayload]


class InsightRequest(BaseModel):
    site_id: int
    energy_summary: str
    forecast_summary: str
    optimization_summary: str


class InsightResponse(BaseModel):
    site_id: int
    insight: str
    confidence: float


class RetrainRequest(BaseModel):
    site_id: int
    telemetry: Optional[List[TelemetryPoint]] = None
    equipment: Optional[List[EquipmentConfigPayload]] = None


class RetrainResponse(BaseModel):
    site_id: int
    forecast_mae: float
    optimization_objective: float


class ModelRegistryEntry(BaseModel):
    model_name: str
    version: str
    accuracy: Optional[float]
    path: str
    created_at: datetime


class ModelRegistryResponse(BaseModel):
    models: List[ModelRegistryEntry]
