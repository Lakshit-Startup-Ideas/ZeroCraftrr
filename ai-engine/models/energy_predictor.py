from __future__ import annotations

from pathlib import Path
from typing import Optional

import torch
from torch import Tensor, nn

MODEL_PATH = Path(__file__).resolve().parent / 'artifacts' / 'energy_predictor.pt'


class EnergyPredictor(nn.Module):
    """Simple feed-forward regressor for next-day energy forecasting."""

    def __init__(self) -> None:
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(24, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x: Tensor) -> Tensor:
        return self.model(x)


def load_model(path: Optional[Path] = None) -> EnergyPredictor:
    predictor = EnergyPredictor()
    artifact = path or MODEL_PATH
    if artifact.exists():
        predictor.load_state_dict(torch.load(artifact, map_location='cpu'))
    else:
        # initialize deterministic weights for reproducibility
        torch.manual_seed(42)
    predictor.eval()
    return predictor


def predict_next_day(load_curve: list[float]) -> float:
    if len(load_curve) != 24:
        raise ValueError('Expected 24 hourly load values')
    model = load_model()
    tensor = torch.tensor(load_curve, dtype=torch.float32)
    with torch.no_grad():
        prediction = model(tensor).item()
    return max(prediction, 0.0)