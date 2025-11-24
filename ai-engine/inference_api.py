from fastapi import FastAPI
from pydantic import BaseModel, Field

from models.energy_predictor import predict_next_day
from models.anomaly_detector import AnomalyResult, load_detector
from models.waste_model import WasteEmissionModel

app = FastAPI(title="ZeroCraftr AI Engine", version="0.1.0")


class EnergyForecastRequest(BaseModel):
    load_curve: list[float] = Field(min_length=24, max_length=24)


class EnergyForecastResponse(BaseModel):
    prediction_kwh: float


class AnomalyDetectionRequest(BaseModel):
    series: list[float] = Field(min_length=1)


class AnomalyDetectionResponse(BaseModel):
    anomalies: list[AnomalyResult]


class WasteEstimationRequest(BaseModel):
    waste_kg: float = Field(gt=0)


class WasteEstimationResponse(BaseModel):
    co2e_prediction: float


@app.post("/forecast/energy", response_model=EnergyForecastResponse)
def forecast_energy(payload: EnergyForecastRequest) -> EnergyForecastResponse:
    prediction = predict_next_day(payload.load_curve)
    return EnergyForecastResponse(prediction_kwh=prediction)


@app.post("/detect/anomalies", response_model=AnomalyDetectionResponse)
def detect_anomalies(payload: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
    detector = load_detector()
    results = detector.predict(payload.series)
    return AnomalyDetectionResponse(anomalies=results)


@app.post("/estimate/waste", response_model=WasteEstimationResponse)
def estimate_waste(payload: WasteEstimationRequest) -> WasteEstimationResponse:
    model = WasteEmissionModel()
    prediction = model.predict(payload.waste_kg)
    return WasteEstimationResponse(co2e_prediction=prediction)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9000)
