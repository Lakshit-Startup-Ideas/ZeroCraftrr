from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Sample:
    timestamp: datetime
    watts: float


def trapezoidal_energy(samples: list[Sample]) -> float:
    if len(samples) < 2:
        return 0.0
    sorted_samples = sorted(samples, key=lambda s: s.timestamp)
    total = 0.0
    for prev, curr in zip(sorted_samples, sorted_samples[1:]):
        delta = (curr.timestamp - prev.timestamp).total_seconds() / 3600.0
        if delta <= 0:
            continue
        total += ((prev.watts + curr.watts) / 2.0) * delta
    return total / 1000.0