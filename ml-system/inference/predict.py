from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow.sklearn
import pandas as pd
import numpy as np
import os

app = FastAPI()

# Load model on startup (mock loading if file not present for CI/CD)
model = None
try:
    # In production, this would load from MLflow Model Registry or local artifact
    # model = mlflow.sklearn.load_model("models:/zerocraftr-forecasting/Production")
    pass
except Exception as e:
    print(f"Warning: Could not load model: {e}")

class InferenceInput(BaseModel):
    hour: int
    day: int
    prev_temp: float
    prev_pressure: float

class OptimizationOutput(BaseModel):
    predicted_temp: float
    recommendation: str
    confidence_interval: list[float]

@app.post("/predict", response_model=OptimizationOutput)
def predict(input_data: InferenceInput):
    # Mock prediction if model not loaded
    if model:
        df = pd.DataFrame([input_data.model_dump()])
        prediction = model.predict(df)[0]
    else:
        # Simple heuristic for fallback
        prediction = input_data.prev_temp * 0.9 + 2.0
    
    # Optimization Logic
    recommendation = "Normal Operation"
    if prediction > 30.0:
        recommendation = "High Temperature Alert: Reduce Load by 20%"
    elif prediction < 10.0:
        recommendation = "Low Temperature Alert: Check Heating Systems"
        
    # Mock Confidence Interval (+/- 10%)
    lower_bound = prediction * 0.9
    upper_bound = prediction * 1.1
    
    return {
        "predicted_temp": prediction,
        "recommendation": recommendation,
        "confidence_interval": [lower_bound, upper_bound]
    }
