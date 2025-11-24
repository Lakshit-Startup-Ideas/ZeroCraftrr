import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from models.intelligent_forecaster import generate_synthetic_telemetry  # type: ignore  # noqa: E402
from models.optimizer import EquipmentConfig  # type: ignore  # noqa: E402
from pipelines.retrain_pipeline import RetrainContext, RetrainPipeline  # type: ignore  # noqa: E402


def test_retrain_pipeline_updates_registry(tmp_path):
    registry_path = tmp_path / "registry.db"
    artifacts: list[str] = []

    def telemetry_loader(site_id: int):
        return generate_synthetic_telemetry(datetime(2024, 1, 1), periods=24 * 8)

    def equipment_loader(site_id: int):
        return [EquipmentConfig(name="machine", load_pct=85, runtime_hours=10, idle_hours=2)]

    context = RetrainContext(
        site_id=1,
        telemetry_loader=telemetry_loader,
        equipment_loader=equipment_loader,
        minio_endpoint="http://localhost:9000",
        minio_access_key="test",
        minio_secret_key="test",
        bucket_name="zerocraftr-tests",
        registry_path=registry_path,
    )

    pipeline = RetrainPipeline(context)

    def export_artifacts_stub():
        path = tmp_path / "model.pt"
        path.write_bytes(b"stub")
        artifacts.append(str(path))
        return {"lstm": str(path)}

    pipeline.forecaster.export_artifacts = export_artifacts_stub  # type: ignore

    result = pipeline.run()
    assert "forecast_mae" in result and result["forecast_mae"] >= 0
    assert "forecast_mape" in result

    conn = sqlite3.connect(registry_path)
    cursor = conn.execute("SELECT COUNT(*) FROM models_registry")
    count = cursor.fetchone()[0]
    conn.close()
    assert count >= 2

    for path in artifacts:
        if os.path.exists(path):
            os.remove(path)
