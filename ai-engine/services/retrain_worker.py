from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Iterable, List

import pandas as pd
import requests

from models.intelligent_forecaster import generate_synthetic_telemetry
from models.optimizer import EquipmentConfig
from pipelines.retrain_pipeline import RetrainContext, RetrainPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retrain_worker")


def _telemetry_from_backend(site_id: int) -> pd.DataFrame | None:
    source = os.getenv("TELEMETRY_SOURCE_URL")
    if not source:
        return None
    try:
        response = requests.get(f"{source.rstrip('/')}/sites/{site_id}/telemetry?hours=168", timeout=15)
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, list) and payload:
            return pd.DataFrame(payload)
    except Exception as exc:  # pragma: no cover - network calls
        logger.warning("Failed to download telemetry: %s", exc)
    return None


def _load_telemetry(site_id: int) -> pd.DataFrame:
    df = _telemetry_from_backend(site_id)
    if df is not None and not df.empty:
        logger.info("Fetched %s telemetry samples from backend", len(df))
        return df
    logger.info("Falling back to synthetic telemetry for site %s", site_id)
    return generate_synthetic_telemetry(datetime.utcnow(), periods=24 * 7)


def _load_equipment() -> List[EquipmentConfig]:
    env_value = os.getenv("OPTIMIZATION_BASELINE")
    if env_value:
        try:
            data = json.loads(env_value)
            return [EquipmentConfig(**entry) for entry in data]
        except json.JSONDecodeError:
            logger.warning("Invalid OPTIMIZATION_BASELINE payload, using defaults.")
    return [
        EquipmentConfig(name="compressor", load_pct=85, runtime_hours=14, idle_hours=6),
        EquipmentConfig(name="conveyor", load_pct=70, runtime_hours=18, idle_hours=2),
    ]


def _context(site_id: int, telemetry: pd.DataFrame, equipment: List[EquipmentConfig]) -> RetrainContext:
    def telemetry_loader(_: int) -> pd.DataFrame:
        return telemetry

    def equipment_loader(_: int) -> Iterable[EquipmentConfig]:
        return equipment

    return RetrainContext(
        site_id=site_id,
        telemetry_loader=telemetry_loader,
        equipment_loader=equipment_loader,
        minio_endpoint=os.getenv("MINIO_ENDPOINT", "http://minio:9000"),
        minio_access_key=os.getenv("MINIO_ACCESS_KEY", "minio"),
        minio_secret_key=os.getenv("MINIO_SECRET_KEY", "minio123"),
        bucket_name=os.getenv("MINIO_MODELS_BUCKET", "zerocraftr-models"),
        registry_path=Path(os.getenv("MODEL_REGISTRY_PATH", "models_registry.db")),
        encryption_key=os.getenv("AI_MINIO_SSE_KEY"),
    )


def main() -> None:
    site_id = int(os.getenv("SITE_ID", "1"))
    telemetry = _load_telemetry(site_id)
    equipment = _load_equipment()
    pipeline = RetrainPipeline(_context(site_id, telemetry, equipment))
    metrics = pipeline.run()
    logger.info("Cron retrain completed for site %s metrics=%s", site_id, metrics)


if __name__ == "__main__":
    main()
