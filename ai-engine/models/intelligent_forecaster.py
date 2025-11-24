from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
import torch
from prometheus_client import Histogram
from torch import nn
from torch.utils.data import DataLoader, Dataset

try:
    from prophet import Prophet  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    Prophet = None

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

_FORECAST_LATENCY = Histogram(
    "forecast_latency_seconds",
    "Latency for generating energy forecasts",
    buckets=(0.01, 0.05, 0.1, 0.5, 1, 2, 5),
)


class _SequenceDataset(Dataset):
    def __init__(self, data: np.ndarray, window: int) -> None:
        self.data = data
        self.window = window

    def __len__(self) -> int:
        return len(self.data) - self.window

    def __getitem__(self, idx: int):
        window = self.data[idx : idx + self.window]
        target = self.data[idx + self.window]
        return torch.tensor(window, dtype=torch.float32), torch.tensor(target, dtype=torch.float32)


class _LSTMRegressor(nn.Module):
    def __init__(self, input_size: int = 1, hidden_size: int = 32, num_layers: int = 1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.head = nn.Linear(hidden_size, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        return self.head(out)


class _DummyProphet:
    """
    Lightweight fallback when Prophet binaries are unavailable.
    Produces hour-of-day seasonal averages with rolling trend.
    """

    def __init__(self) -> None:
        self.hourly_profile: dict[int, float] = {}
        self.trend: float = 0.0

    def fit(self, df: pd.DataFrame) -> None:
        df = df.copy()
        df["hour"] = df["ds"].dt.hour
        hourly_means = df.groupby("hour")["y"].mean()
        self.hourly_profile = hourly_means.to_dict()
        self.trend = (df["y"].iloc[-1] - df["y"].iloc[0]) / max(len(df) - 1, 1)

    def predict(self, future_df: pd.DataFrame) -> pd.DataFrame:
        future_df = future_df.copy()
        future_df["hour"] = future_df["ds"].dt.hour
        baseline = future_df["hour"].map(self.hourly_profile).fillna(np.mean(list(self.hourly_profile.values())))
        steps = np.arange(len(future_df))
        trend = baseline + steps * self.trend
        return pd.DataFrame({"ds": future_df["ds"], "yhat": trend})


def _get_prophet() -> object:
    if Prophet is None:
        return _DummyProphet()
    return Prophet(daily_seasonality=True, weekly_seasonality=True, seasonality_mode="additive")


@dataclass
class ForecastResult:
    timestamp: datetime
    prediction: float
    lower: float
    upper: float
    components: Dict[str, float]


class IntelligentForecaster:
    """
    Ensemble forecaster combining LSTM, Prophet, and RandomForest regressors.
    The forecaster expects telemetry data with at least columns:
    - timestamp (datetime)
    - energy_kwh (float)
    Optionally accepts additional contextual features.
    """

    def __init__(self, window: int = 24, device: Optional[str] = None) -> None:
        self.window = window
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.lstm = _LSTMRegressor().to(self.device)
        self.prophet = _get_prophet()
        self.random_forest = RandomForestRegressor(n_estimators=200, random_state=42)
        self.history: pd.DataFrame | None = None
        self.residuals: List[float] = []

    def _prepare_dataframe(self, telemetry: pd.DataFrame) -> pd.DataFrame:
        df = telemetry.copy()
        if "timestamp" not in df.columns:
            raise ValueError("telemetry must contain 'timestamp'")
        if "energy_kwh" not in df.columns:
            raise ValueError("telemetry must contain 'energy_kwh'")
        df = df.sort_values("timestamp").reset_index(drop=True)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["dayofweek"] = df["timestamp"].dt.dayofweek
        df["sin_hour"] = np.sin(2 * math.pi * df["hour"] / 24)
        df["cos_hour"] = np.cos(2 * math.pi * df["hour"] / 24)
        return df

    def fit(self, telemetry: pd.DataFrame, epochs: int = 50, lr: float = 0.005) -> Dict[str, float]:
        df = self._prepare_dataframe(telemetry)
        self.history = df
        series = df["energy_kwh"].astype(float).values
        dataset = _SequenceDataset(series, self.window)
        dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

        criterion = nn.L1Loss()
        optimizer = torch.optim.Adam(self.lstm.parameters(), lr=lr)
        self.lstm.train()
        for _ in range(epochs):
            for batch_x, batch_y in dataloader:
                batch_x = batch_x.unsqueeze(-1).to(self.device)
                batch_y = batch_y.unsqueeze(-1).to(self.device)
                optimizer.zero_grad()
                preds = self.lstm(batch_x)
                loss = criterion(preds, batch_y)
                loss.backward()
                optimizer.step()

        # Fit prophet component
        prophet_df = pd.DataFrame({"ds": df["timestamp"], "y": df["energy_kwh"].astype(float)})
        self.prophet.fit(prophet_df)

        # Fit random forest component
        features = df[["hour", "dayofweek", "sin_hour", "cos_hour"]]
        self.random_forest.fit(features, df["energy_kwh"].astype(float))

        # Compute residuals for confidence estimation using in-sample RF baseline
        actual = df["energy_kwh"].astype(float)
        rf_in_sample = self.random_forest.predict(features)
        self.residuals = list((actual - rf_in_sample)[-48:])
        mae = float(mean_absolute_error(actual, rf_in_sample))
        with np.errstate(divide="ignore", invalid="ignore"):
            mape_series = np.abs((actual - rf_in_sample) / np.where(actual == 0, 1e-3, actual))
        mape = float(np.mean(mape_series) * 100.0)
        variance = float(np.var(rf_in_sample))

        return {"mae": mae, "mape": mape, "variance": variance}

    def _predict_components(self, horizon_hours: int, training: bool = False) -> Dict[str, np.ndarray]:
        if self.history is None:
            raise RuntimeError("Forecaster must be fitted before predicting.")
        history = self.history

        # LSTM iterative forecast
        lstm_inputs = history["energy_kwh"].astype(float).values
        lstm_state = lstm_inputs.copy()
        self.lstm.eval()
        lstm_preds: List[float] = []
        with torch.no_grad():
            for _ in range(horizon_hours):
                window = lstm_state[-self.window :]
                tens = torch.tensor(window, dtype=torch.float32, device=self.device).unsqueeze(0).unsqueeze(-1)
                pred = self.lstm(tens).cpu().item()
                lstm_preds.append(pred)
                lstm_state = np.append(lstm_state, pred)

        # Prophet component
        start_ts = history["timestamp"].iloc[-1] + timedelta(hours=1)
        future_dates = pd.date_range(start_ts, periods=horizon_hours, freq="H")
        prophet_future = pd.DataFrame({"ds": future_dates})
        prophet_preds_df = self.prophet.predict(prophet_future)
        prophet_preds = prophet_preds_df["yhat"].to_numpy()

        # RandomForest component
        future_features = pd.DataFrame(
            {
                "timestamp": future_dates,
            }
        )
        future_features["hour"] = future_features["timestamp"].dt.hour
        future_features["dayofweek"] = future_features["timestamp"].dt.dayofweek
        future_features["sin_hour"] = np.sin(2 * math.pi * future_features["hour"] / 24)
        future_features["cos_hour"] = np.cos(2 * math.pi * future_features["hour"] / 24)
        rf_preds = self.random_forest.predict(future_features[["hour", "dayofweek", "sin_hour", "cos_hour"]])

        predictions = {
            "lstm": np.array(lstm_preds),
            "prophet": np.array(prophet_preds),
            "rf": np.array(rf_preds),
            "timestamps": future_dates,
        }

        if training:
            # For residual computation return predictions aligned with last known points
            offset = len(self.history) - len(predictions["lstm"])
            predictions["timestamps"] = self.history["timestamp"].iloc[offset:]
        return {"predictions": predictions}

    def _combine_components(self, components: Dict[str, np.ndarray]) -> np.ndarray:
        lstm_preds = components["lstm"]
        prophet_preds = components["prophet"]
        rf_preds = components["rf"]
        return 0.5 * lstm_preds + 0.3 * prophet_preds + 0.2 * rf_preds

    @_FORECAST_LATENCY.time()
    def predict(self, horizon_hours: int = 24) -> List[ForecastResult]:
        components = self._predict_components(horizon_hours)["predictions"]
        combined = self._combine_components(components)
        if self.residuals:
            residual_std = float(np.std(self.residuals))
        else:
            residual_std = float(np.std(combined) * 0.1)

        results: List[ForecastResult] = []
        for idx, ts in enumerate(components["timestamps"]):
            pred = float(combined[idx])
            lower = pred - 1.96 * residual_std
            upper = pred + 1.96 * residual_std
            results.append(
                ForecastResult(
                    timestamp=pd.Timestamp(ts).to_pydatetime(),
                    prediction=pred,
                    lower=lower,
                    upper=upper,
                    components={
                        "lstm": float(components["lstm"][idx]),
                        "prophet": float(components["prophet"][idx]),
                        "rf": float(components["rf"][idx]),
                    },
                )
            )
        return results

    def export_artifacts(self) -> Dict[str, str]:
        """
        Serialize model weights for persistence. Returns mapping of artifact names to file paths.
        """
        if self.history is None:
            raise RuntimeError("Fit model before exporting.")

        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        paths: Dict[str, str] = {}
        lstm_path = f"intelligent_forecaster_lstm_{timestamp}.pt"
        torch.save(self.lstm.state_dict(), lstm_path)
        paths["lstm"] = lstm_path

        rf_path = f"intelligent_forecaster_rf_{timestamp}.joblib"
        import joblib

        joblib.dump(self.random_forest, rf_path)
        paths["random_forest"] = rf_path

        prophet_path = f"intelligent_forecaster_prophet_{timestamp}.json"
        if isinstance(self.prophet, _DummyProphet):
            payload = {
                "hourly_profile": self.prophet.hourly_profile,
                "trend": self.prophet.trend,
            }
        else:
            payload = getattr(self.prophet, "component_modes", {})
        with open(prophet_path, "w", encoding="utf-8") as f:
            json.dump(payload, f)
        paths["prophet"] = prophet_path

        return paths


def compute_mae(actual: List[float], predicted: List[float]) -> float:
    return float(mean_absolute_error(actual, predicted))


def generate_synthetic_telemetry(
    start: datetime,
    periods: int,
    freq: str = "H",
    noise_scale: float = 2.0,
) -> pd.DataFrame:
    """
    Utility for tests and local experimentation.
    Creates sinusoidal energy telemetry with noise.
    """
    timestamps = pd.date_range(start=start, periods=periods, freq=freq)
    base = 50 + 10 * np.sin(np.linspace(0, 3 * math.pi, periods))
    daily = 5 * np.sin(2 * math.pi * timestamps.hour / 24)
    random.seed(42)
    noise = np.random.normal(0, noise_scale, size=periods)
    energy = base + daily + noise
    return pd.DataFrame({"timestamp": timestamps, "energy_kwh": energy})
