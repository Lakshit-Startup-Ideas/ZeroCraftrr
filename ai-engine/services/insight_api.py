from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Dict

from fastapi import Depends, FastAPI
from pydantic import BaseModel

from llm.insight_generator import InsightGenerator
from .common import register_metrics_endpoint, require_jwt

logger = logging.getLogger(__name__)
MODEL_NAME = os.getenv("INSIGHT_MODEL_NAME", "distilgpt2")
generator = InsightGenerator(model_name=MODEL_NAME)
app = FastAPI(title="ZeroCraftr Insight Service", version="0.3.0")
register_metrics_endpoint(app)


class InsightRequest(BaseModel):
    site_id: int
    energy_summary: str
    forecast_summary: str
    optimization_summary: str


class InsightResponse(BaseModel):
    site_id: int
    insight: str
    confidence: float
    generated_at: datetime


@app.post("/api/v2/insights", response_model=InsightResponse)
def generate_insight(payload: InsightRequest, _: dict = Depends(require_jwt)) -> InsightResponse:
    result = generator.generate(payload.dict())
    logger.info("Insight generated for site %s at %s", payload.site_id, datetime.utcnow().isoformat())
    return InsightResponse(
        site_id=payload.site_id,
        insight=result.get("insight", ""),
        confidence=float(result.get("confidence", 0.0)),
        generated_at=datetime.utcnow(),
    )


@app.get("/healthz")
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9003)
