from __future__ import annotations

import hashlib
import json
import logging
import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable, Iterable, Optional

import pandas as pd
from minio import Minio
from minio.sse import SseCustomerKey

from ..models.intelligent_forecaster import IntelligentForecaster
from ..models.optimizer import EquipmentConfig, OptimizationEngine, sample_evaluator

logger = logging.getLogger(__name__)


@dataclass
class RetrainContext:
    site_id: int
    telemetry_loader: Callable[[int], pd.DataFrame]
    equipment_loader: Callable[[int], Iterable[EquipmentConfig]]
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    bucket_name: str = "zerocraftr-models"
    registry_path: Path = Path("models_registry.db")
    encryption_key: Optional[str] = None


class RetrainPipeline:
    """
    Coordinates nightly retraining of forecasting and optimization models.
    Saves artifacts to MinIO and records metadata in a SQLite-backed registry by default.
    """

    def __init__(self, context: RetrainContext) -> None:
        self.context = context
        self.forecaster = IntelligentForecaster()
        self.optimizer = OptimizationEngine(sample_evaluator)
        key_material = context.encryption_key or os.getenv("AI_MINIO_SSE_KEY", "zerocraftr-default-model-key")
        self._sse_key = SseCustomerKey(hashlib.sha256(key_material.encode("utf-8")).digest())
        self.client = Minio(
            context.minio_endpoint.replace("http://", "").replace("https://", ""),
            access_key=context.minio_access_key,
            secret_key=context.minio_secret_key,
            secure=context.minio_endpoint.startswith("https"),
        )

    def ensure_bucket(self) -> None:
        try:
            if not self.client.bucket_exists(self.context.bucket_name):
                self.client.make_bucket(self.context.bucket_name)
        except Exception as exc:  # pragma: no cover - network dependent
            logger.warning("Unable to verify MinIO bucket (%s). Continuing in offline mode.", exc)

    def _upload_artifacts(self, artifacts: dict[str, str]) -> dict[str, str]:
        uploaded_paths: dict[str, str] = {}
        try:
            self.ensure_bucket()
            for name, path in artifacts.items():
                object_name = f"site-{self.context.site_id}/{Path(path).name}"
                self.client.fput_object(self.context.bucket_name, object_name, path, sse=self._sse_key)
                uploaded_paths[name] = object_name
        except Exception as exc:  # pragma: no cover - network dependent
            logger.warning("Failed to upload to MinIO (%s). Retaining local artifacts.", exc)
            for name, path in artifacts.items():
                uploaded_paths[name] = Path(path).resolve().as_posix()
        return uploaded_paths

    def _record_registry(self, model_name: str, accuracy: float, artifact_path: str) -> None:
        conn = sqlite3.connect(self.context.registry_path)
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
            conn.execute(
                """
                INSERT INTO models_registry (model_name, version, accuracy, path, created_at)
                VALUES (?, ?, ?, ?, ?)
            """,
                (
                    model_name,
                    datetime.utcnow().strftime("%Y%m%d%H%M%S"),
                    accuracy,
                    artifact_path,
                    datetime.utcnow().isoformat(),
                ),
            )
        conn.close()

    def run(self) -> dict[str, float]:
        logger.info("Starting retrain pipeline for site %s", self.context.site_id)
        telemetry = self.context.telemetry_loader(self.context.site_id)
        if telemetry.empty:
            raise ValueError("No telemetry available for retraining.")
        metrics = self.forecaster.fit(telemetry)
        logger.info(
            "Forecaster retrained for site %s at %s (MAE=%.4f, MAPE=%.2f%%)",
            self.context.site_id,
            datetime.utcnow().isoformat(),
            metrics["mae"],
            metrics.get("mape", 0.0),
        )
        artifacts = self.forecaster.export_artifacts()
        uploaded = self._upload_artifacts(artifacts)
        self._record_registry("intelligent_forecaster", metrics["mae"], json.dumps(uploaded))

        equipments = list(self.context.equipment_loader(self.context.site_id))
        opt_result = self.optimizer.optimize(equipments)
        logger.info(
            "Optimization retrained for site %s at %s (objective=%.4f, savings=%.2f%%)",
            self.context.site_id,
            datetime.utcnow().isoformat(),
            opt_result.objective,
            opt_result.savings_pct,
        )
        self._record_registry("optimization_engine", opt_result.objective, json.dumps([cfg.__dict__ for cfg in opt_result.recommended]))

        return {
            "forecast_mae": metrics["mae"],
            "forecast_mape": metrics.get("mape", 0.0),
            "optimization_objective": opt_result.objective,
        }


def default_loader(site_id: int) -> pd.DataFrame:
    raise NotImplementedError("Provide telemetry loader implementation.")


def default_equipment_loader(site_id: int) -> Iterable[EquipmentConfig]:
    raise NotImplementedError("Provide equipment loader implementation.")
