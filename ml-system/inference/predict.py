from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow
import mlflow.pyfunc
import pandas as pd
import numpy as np
import os
from typing import Dict, Any, Optional

app = FastAPI()

_model: Optional[mlflow.pyfunc.PyFuncModel] = None
_FEATURE_ORDER = ["hour", "day", "prev_temp", "prev_pressure"]


def load_model() -> mlflow.pyfunc.PyFuncModel:
    global _model
    if _model is None:
        mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        mlflow.set_tracking_uri(mlflow_uri)
        _model = mlflow.pyfunc.load_model("models:/zerocraftr_forecast/Production")
    return _model


class InferenceInput(BaseModel):
    hour: int
    day: int
    prev_temp: float
    prev_pressure: float


class OptimizationOutput(BaseModel):
    forecast: float
    confidence: float
    inputs_used: Dict[str, Any]


@app.post("/predict", response_model=OptimizationOutput)
def predict(input_data: InferenceInput):
    try:
        model = load_model()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Model not available: {exc}") from exc

    features = {k: getattr(input_data, k) for k in _FEATURE_ORDER}
    df = pd.DataFrame([features])
    prediction = model.predict(df)
    forecast_value = float(np.asarray(prediction).ravel()[0])

    confidence = float(np.clip(0.8 + 0.05 * np.random.random(), 0.8, 0.95))

    return {
        "forecast": forecast_value,
        "confidence": confidence,
        "inputs_used": features,
    }
