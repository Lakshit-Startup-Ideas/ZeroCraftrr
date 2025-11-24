from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from ..core.config import get_settings


@dataclass
class PowerSample:
    timestamp: datetime
    watts: float


def integrate_energy(samples: Sequence[PowerSample]) -> float:
    """Integrate watt samples over time to obtain energy in kWh."""
    if len(samples) < 2:
        return 0.0

    sorted_samples = sorted(samples, key=lambda s: s.timestamp)
    total_wh = 0.0
    for prev, curr in zip(sorted_samples, sorted_samples[1:]):
        delta_seconds = (curr.timestamp - prev.timestamp).total_seconds()
        if delta_seconds <= 0:
            continue
        total_wh += ((prev.watts + curr.watts) / 2.0) * (delta_seconds / 3600.0)
    return total_wh / 1000.0


def summarize_telemetry(records: Iterable[dict]) -> dict[str, float]:
    """
    Accepts raw telemetry records and produces aggregate totals for energy, emissions, waste.
    Each record must provide metric, value, unit, and derived metadata.
    """
    settings = get_settings()
    totals = {
        "total_energy_kwh": 0.0,
        "total_co2_kg": 0.0,
        "total_waste_kg": 0.0,
        "total_waste_co2_kg": 0.0,
    }

    energy_samples: list[PowerSample] = []

    for record in records:
        metric = record.get("metric")
        value = float(record.get("value", 0))
        unit = record.get("unit")
        timestamp = record.get("timestamp") or datetime.utcnow()
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)

        if metric == "power" and unit in {"W", "watt", "watts"}:
            energy_samples.append(PowerSample(timestamp, value))
        elif metric == "waste_mass" and unit == "kg":
            totals["total_waste_kg"] += value
            waste_factor = record.get("emission_factor") or settings.waste_factors[0]
            totals["total_waste_co2_kg"] += value * float(waste_factor)

    totals["total_energy_kwh"] = integrate_energy(energy_samples)
    totals["total_co2_kg"] = totals["total_energy_kwh"] * settings.emission_factor

    return totals
