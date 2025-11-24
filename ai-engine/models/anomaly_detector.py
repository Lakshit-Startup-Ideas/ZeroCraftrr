from __future__ import annotations

from typing import Iterable, List

import numpy as np
from joblib import dump, load
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

MODEL_PATH = __file__.replace('anomaly_detector.py', 'artifacts/anomaly_detector.joblib')


class AnomalyResult(BaseModel):
    value: float
    z_score: float
    is_anomaly: bool


class EnergyAnomalyDetector:
    def __init__(self) -> None:
        self.model = IsolationForest(contamination=0.05, random_state=42)

    def fit(self, series: Iterable[float]) -> None:
        arr = np.array(list(series)).reshape(-1, 1)
        if len(arr) < 10:
            raise ValueError('Need at least 10 data points to train the detector')
        self.model.fit(arr)
        dump(self.model, MODEL_PATH)

    def predict(self, series: Iterable[float]) -> List[AnomalyResult]:
        arr = np.array(list(series)).reshape(-1, 1)
        if len(arr) == 0:
            return []
        predictions = self.model.predict(arr)
        scores = self.model.decision_function(arr)
        mean = arr.mean()
        std = arr.std() or 1
        results = []
        for value, prediction, score in zip(arr.flatten(), predictions, scores):
            z_score = (value - mean) / std
            is_anomaly = prediction == -1 or abs(z_score) > 3
            results.append(AnomalyResult(value=float(value), z_score=float(z_score), is_anomaly=is_anomaly))
        return results


def load_detector() -> EnergyAnomalyDetector:
    detector = EnergyAnomalyDetector()
    try:
        detector.model = load(MODEL_PATH)
    except FileNotFoundError:
        detector.model.fit(np.linspace(0.5, 1.5, 100).reshape(-1, 1))
    return detector
