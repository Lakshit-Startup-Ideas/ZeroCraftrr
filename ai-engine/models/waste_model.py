from __future__ import annotations

from pathlib import Path

import numpy as np
from joblib import dump, load
from sklearn.linear_model import LinearRegression

MODEL_PATH = Path(__file__).resolve().parent / 'artifacts' / 'waste_model.joblib'


class WasteEmissionModel:
    def __init__(self) -> None:
        self.model = LinearRegression()
        self._ensure_model()

    def _ensure_model(self) -> None:
        if MODEL_PATH.exists():
            self.model = load(MODEL_PATH)
        else:
            # Train a baseline model that approximates typical conversion factors
            x = np.array([[0.5], [1.0], [1.5], [2.0]])
            y = np.array([1.0, 2.5, 3.3, 4.8])
            self.model.fit(x, y)
            dump(self.model, MODEL_PATH)

    def predict(self, waste_kg: float) -> float:
        prediction = self.model.predict([[waste_kg]])[0]
        return float(max(prediction, 0.0))