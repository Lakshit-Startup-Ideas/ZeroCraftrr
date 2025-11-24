from __future__ import annotations

import logging
from datetime import datetime
from typing import Dict, List

from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field

from models.optimizer import EquipmentConfig, OptimizationEngine, sample_evaluator
from .common import register_metrics_endpoint, require_jwt

logger = logging.getLogger(__name__)
app = FastAPI(title="ZeroCraftr Optimization Service", version="0.3.0")
register_metrics_endpoint(app)


class EquipmentPayload(BaseModel):
    name: str
    load_pct: float = Field(..., gt=0)
    runtime_hours: float = Field(..., gt=0)
    idle_hours: float = Field(..., ge=0)


class OptimizationRequest(BaseModel):
    site_id: int
    lambda_weight: float = Field(0.5, ge=0)
    equipment: List[EquipmentPayload]


class OptimizationResponse(BaseModel):
    site_id: int
    objective: float
    baseline_objective: float
    savings_pct: float
    energy_kwh: float
    co2_kg: float
    recommended: List[EquipmentPayload]
    generated_at: datetime


@app.post("/api/v2/optimize", response_model=OptimizationResponse)
def optimize(payload: OptimizationRequest, _: dict = Depends(require_jwt)) -> OptimizationResponse:
    configs = [EquipmentConfig(**cfg.dict()) for cfg in payload.equipment]
    engine = OptimizationEngine(sample_evaluator, lambda_weight=payload.lambda_weight)
    result = engine.optimize(configs)
    logger.info(
        "Optimization completed for site %s at %s (objective %.2f, savings %.2f%%)",
        payload.site_id,
        datetime.utcnow().isoformat(),
        result.objective,
        result.savings_pct,
    )
    return OptimizationResponse(
        site_id=payload.site_id,
        objective=result.objective,
        baseline_objective=result.baseline_objective,
        savings_pct=result.savings_pct,
        energy_kwh=result.energy_kwh,
        co2_kg=result.co2_kg,
        recommended=[EquipmentPayload(**cfg.__dict__) for cfg in result.recommended],
        generated_at=datetime.utcnow(),
    )


@app.get("/healthz")
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9002)
