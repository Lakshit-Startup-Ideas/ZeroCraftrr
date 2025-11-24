from __future__ import annotations

import logging
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Iterable, List

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from models.optimizer import EquipmentConfig
from pipelines.retrain_pipeline import RetrainContext, RetrainPipeline
from .common import register_metrics_endpoint, require_jwt

logger = logging.getLogger(__name__)
app = FastAPI(title="ZeroCraftr Retraining Service", version="0.3.0")
register_metrics_endpoint(app)


class TelemetryPoint(BaseModel):
    timestamp: datetime
    energy_kwh: float = Field(..., gt=0)


class EquipmentPayload(BaseModel):
    name: str
    load_pct: float = Field(..., gt=0)
    runtime_hours: float = Field(..., gt=0)
    idle_hours: float = Field(..., ge=0)


class RetrainRequest(BaseModel):
    site_id: int
    telemetry: List[TelemetryPoint]
    equipment: List[EquipmentPayload] = Field(default_factory=list)


class RetrainResponse(BaseModel):
    site_id: int
    forecast_mae: float
    forecast_mape: float
    optimization_objective: float


class ModelRegistryEntry(BaseModel):
    model_name: str
    version: str
    accuracy: float | None
    path: str
    created_at: datetime


class ModelRegistryResponse(BaseModel):
    models: List[ModelRegistryEntry]


def _registry_path() -> Path:
    return Path(os.getenv("MODEL_REGISTRY_PATH", "models_registry.db"))


def _build_dataframe(telemetry: List[TelemetryPoint]) -> pd.DataFrame:
    if not telemetry:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="telemetry payload is required")
    df = pd.DataFrame([{"timestamp": item.timestamp, "energy_kwh": item.energy_kwh} for item in telemetry])
    return df.sort_values("timestamp").reset_index(drop=True)


def _build_equipment(equipment: List[EquipmentPayload]) -> List[EquipmentConfig]:
    if equipment:
        return [EquipmentConfig(**item.dict()) for item in equipment]
    return [EquipmentConfig(name="baseline", load_pct=85, runtime_hours=16, idle_hours=4)]


def _context(payload: RetrainRequest, df: pd.DataFrame, equipment: List[EquipmentConfig]) -> RetrainContext:
    def telemetry_loader(_: int) -> pd.DataFrame:
        return df

    def equipment_loader(_: int) -> Iterable[EquipmentConfig]:
        return equipment

    return RetrainContext(
        site_id=payload.site_id,
        telemetry_loader=telemetry_loader,
        equipment_loader=equipment_loader,
        minio_endpoint=os.getenv("MINIO_ENDPOINT", "http://minio:9000"),
        minio_access_key=os.getenv("MINIO_ACCESS_KEY", "minio"),
        minio_secret_key=os.getenv("MINIO_SECRET_KEY", "minio123"),
        bucket_name=os.getenv("MINIO_MODELS_BUCKET", "zerocraftr-models"),
        registry_path=_registry_path(),
        encryption_key=os.getenv("AI_MINIO_SSE_KEY"),
    )


@app.post("/api/v2/models/retrain", response_model=RetrainResponse)
def retrain_models(payload: RetrainRequest, _: dict = Depends(require_jwt)) -> RetrainResponse:
    telemetry_df = _build_dataframe(payload.telemetry)
    equipment = _build_equipment(payload.equipment)
    pipeline = RetrainPipeline(_context(payload, telemetry_df, equipment))
    metrics = pipeline.run()
    logger.info("Manual retrain completed for site %s with metrics %s", payload.site_id, metrics)
    return RetrainResponse(
        site_id=payload.site_id,
        forecast_mae=metrics["forecast_mae"],
        forecast_mape=metrics["forecast_mape"],
        optimization_objective=metrics["optimization_objective"],
    )


@app.get("/api/v2/models/list", response_model=ModelRegistryResponse)
def list_models(_: dict = Depends(require_jwt)) -> ModelRegistryResponse:
    path = _registry_path()
    if not path.exists():
        return ModelRegistryResponse(models=[])
    conn = sqlite3.connect(path)
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS models_registry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT NOT NULL,
                version TEXT NOT NULL,
                accuracy REAL,
                path TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        rows = conn.execute(
            """
            SELECT model_name, version, accuracy, path, created_at
            FROM models_registry
            ORDER BY created_at DESC
            LIMIT 100
        """
        ).fetchall()
    models = [
        ModelRegistryEntry(
            model_name=row[0],
            version=row[1],
            accuracy=row[2],
            path=row[3],
            created_at=datetime.fromisoformat(row[4]),
        )
        for row in rows
    ]
    return ModelRegistryResponse(models=models)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9004)
