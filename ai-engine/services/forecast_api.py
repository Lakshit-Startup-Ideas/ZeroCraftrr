from __future__ import annotations

from datetime import datetime
from typing import Dict, List

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from models.intelligent_forecaster import ForecastResult, IntelligentForecaster
from .common import register_metrics_endpoint, require_jwt

app = FastAPI(title="ZeroCraftr Forecast Service", version="0.3.0")
register_metrics_endpoint(app)
_MIN_TELEMETRY_POINTS = 24 * 7


class TelemetryPoint(BaseModel):
    timestamp: datetime
    energy_kwh: float = Field(..., gt=0)


class ForecastRequest(BaseModel):
    site_id: int
    telemetry: List[TelemetryPoint]
    horizon_hours: int = Field(24, ge=1, le=168)


class ForecastComponent(BaseModel):
    timestamp: datetime
    prediction: float
    lower: float
    upper: float
    components: Dict[str, float]


class ForecastResponse(BaseModel):
    site_id: int
    metrics: Dict[str, float]
    points: List[ForecastComponent]
    recent_actuals: List[TelemetryPoint]


def _build_dataframe(points: List[TelemetryPoint]) -> pd.DataFrame:
    df = pd.DataFrame([{"timestamp": item.timestamp, "energy_kwh": item.energy_kwh} for item in points])
    df = df.sort_values("timestamp")
    if len(df) < _MIN_TELEMETRY_POINTS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"At least {_MIN_TELEMETRY_POINTS} telemetry samples are required for training.",
        )
    return df.tail(_MIN_TELEMETRY_POINTS).reset_index(drop=True)


def _serialize_results(results: List[ForecastResult]) -> List[ForecastComponent]:
    return [
        ForecastComponent(
            timestamp=result.timestamp,
            prediction=result.prediction,
            lower=result.lower,
            upper=result.upper,
            components=result.components,
        )
        for result in results
    ]


@app.post("/api/v2/forecast/combined", response_model=ForecastResponse)
def combined_forecast(payload: ForecastRequest, _: dict = Depends(require_jwt)) -> ForecastResponse:
    telemetry_df = _build_dataframe(payload.telemetry)
    forecaster = IntelligentForecaster()
    metrics = forecaster.fit(telemetry_df)
    forecast_points = forecaster.predict(payload.horizon_hours)
    serialized = _serialize_results(forecast_points)
    recent_actuals = telemetry_df.tail(24)

    return ForecastResponse(
        site_id=payload.site_id,
        metrics={
            "mae": metrics["mae"],
            "mape": metrics.get("mape", 0.0),
        },
        points=serialized,
        recent_actuals=[
            TelemetryPoint(timestamp=row.timestamp.to_pydatetime(), energy_kwh=float(row.energy_kwh))
            for row in recent_actuals.itertuples()
        ],
    )


@app.get("/healthz")
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9001)
