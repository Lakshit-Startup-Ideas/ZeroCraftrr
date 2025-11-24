from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.deps import get_current_user, oauth2_scheme
from ...db import models
from ...db.session import get_db
from ...services import ai_bridge
from .schemas import (
    ForecastCombinedRequest,
    ForecastCombinedResponse,
    ForecastComponent,
    InsightRequest,
    InsightResponse,
    EquipmentConfigPayload,
    ModelRegistryEntry,
    ModelRegistryResponse,
    OptimizationRequest,
    OptimizationResponse,
    RetrainRequest,
    RetrainResponse,
    TelemetryPoint,
)

router = APIRouter(tags=["ai"])


def _collect_telemetry(site_id: int, db: Session, lookback_hours: int) -> List[TelemetryPoint]:
    cutoff = datetime.utcnow() - timedelta(hours=lookback_hours)
    query = (
        db.query(models.Telemetry)
        .join(models.Device)
        .filter(models.Device.site_id == site_id)
        .filter(models.Telemetry.timestamp >= cutoff)
        .order_by(models.Telemetry.timestamp.desc())
    )
    records = query.limit(lookback_hours * 4).all()  # allow up to 15 min cadence
    if not records:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No telemetry available for site")

    points: List[TelemetryPoint] = []
    for rec in reversed(records):
        metric = rec.metric.lower()
        if metric in {"energy_kwh", "energy"}:
            energy = float(rec.value)
        elif metric in {"power", "w"}:
            energy = float(rec.value) / 1000.0
        else:
            continue
        points.append(TelemetryPoint(timestamp=rec.timestamp, energy_kwh=energy))
    if not points:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Site lacks energy telemetry")
    return points


@router.post("/forecast/combined", response_model=ForecastCombinedResponse)
async def forecast_combined(
    payload: ForecastCombinedRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    telemetry = payload.telemetry or _collect_telemetry(payload.site_id, db, payload.lookback_hours)
    serialized = [
        {
            "timestamp": point.timestamp.isoformat(),
            "energy_kwh": point.energy_kwh,
        }
        for point in telemetry
    ]
    response = await ai_bridge.request_forecast(
        {
            "site_id": payload.site_id,
            "horizon_hours": payload.horizon_hours,
            "telemetry": serialized,
        },
        token,
    )
    points = [
        ForecastComponent(
            timestamp=datetime.fromisoformat(item["timestamp"]),
            prediction=item["prediction"],
            lower=item["lower"],
            upper=item["upper"],
            components=item.get("components", {}),
        )
        for item in response.get("points", [])
    ]
    if not points:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI forecast unavailable")
    metrics = response.get("metrics", {})
    actual_payload = response.get("recent_actuals", [])
    recent_actuals = [
        TelemetryPoint(timestamp=datetime.fromisoformat(item["timestamp"]), energy_kwh=item["energy_kwh"])
        for item in actual_payload
    ]
    return ForecastCombinedResponse(
        site_id=payload.site_id,
        horizon_hours=payload.horizon_hours,
        points=points,
        metrics=metrics,
        recent_actuals=recent_actuals,
    )


@router.post("/optimize", response_model=OptimizationResponse)
async def optimize(
    payload: OptimizationRequest,
    _user: models.User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    response = await ai_bridge.request_optimization(
        {
            "site_id": payload.site_id,
            "lambda_weight": payload.lambda_weight,
            "equipment": [cfg.dict() for cfg in payload.equipment],
        },
        token,
    )
    recommended_configs = [EquipmentConfigPayload(**item) for item in response.get("recommended", [])]
    return OptimizationResponse(
        site_id=payload.site_id,
        objective=response.get("objective", 0.0),
        baseline_objective=response.get("baseline_objective", 0.0),
        savings_pct=response.get("savings_pct", 0.0),
        recommended=recommended_configs,
    )


@router.post("/insights", response_model=InsightResponse)
async def generate_insight(
    payload: InsightRequest,
    _user: models.User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    response = await ai_bridge.request_insight(payload.dict(), token)
    return InsightResponse(site_id=payload.site_id, insight=response.get("insight", ""), confidence=response.get("confidence", 0.0))


@router.post("/models/retrain", response_model=RetrainResponse)
async def retrain_models(
    payload: RetrainRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    telemetry = payload.telemetry or _collect_telemetry(payload.site_id, db, 24 * 7)
    equipment = payload.equipment or []
    response = await ai_bridge.trigger_retrain(
        {
            "site_id": payload.site_id,
            "telemetry": [point.dict() for point in telemetry],
            "equipment": [cfg.dict() for cfg in equipment],
        },
        token,
    )
    return RetrainResponse(
        site_id=payload.site_id,
        forecast_mae=response.get("forecast_mae", 0.0),
        optimization_objective=response.get("optimization_objective", 0.0),
    )


@router.get("/models/list", response_model=ModelRegistryResponse)
async def list_models(
    _user: models.User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    response = await ai_bridge.fetch_models(token)
    models_payload = response.get("models", [])
    return ModelRegistryResponse(models=[ModelRegistryEntry(**entry) for entry in models_payload])
