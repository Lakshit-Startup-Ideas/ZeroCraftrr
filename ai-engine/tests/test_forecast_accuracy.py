from datetime import datetime
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from models.intelligent_forecaster import (  # type: ignore  # noqa: E402
    IntelligentForecaster,
    compute_mae,
    generate_synthetic_telemetry,
)


def test_forecast_accuracy():
    start = datetime(2024, 1, 1)
    full_data = generate_synthetic_telemetry(start, periods=24 * 15)
    train, future = full_data.iloc[:-24], full_data.iloc[-24:]
    forecaster = IntelligentForecaster(window=24, device="cpu")
    metrics = forecaster.fit(train, epochs=10)
    assert metrics["mae"] < 15
    assert metrics["mape"] > 0

    results = forecaster.predict(24)
    preds = [r.prediction for r in results]
    mae = compute_mae(list(future["energy_kwh"].astype(float)), preds)

    assert len(results) == 24
    assert mae < 10
