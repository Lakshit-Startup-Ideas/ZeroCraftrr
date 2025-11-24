from datetime import datetime
from typing import Iterable

from sqlalchemy.orm import Session

from ..db import models


def create_alert(
    db: Session, *, device_id: int, message: str, severity: str = "medium", created_at: datetime | None = None
) -> models.Alert:
    alert = models.Alert(
        device_id=device_id,
        message=message,
        severity=severity,
        created_at=created_at or datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def evaluate_energy_threshold(db: Session, device: models.Device, energy_kwh: float, threshold: float) -> None:
    if energy_kwh > threshold:
        create_alert(
            db,
            device_id=device.id,
            severity="high",
            message=f"Energy threshold exceeded: {energy_kwh:.2f} kWh > {threshold} kWh",
        )


def evaluate_waste_spike(db: Session, device: models.Device, waste_series: Iterable[float], sigma_limit: float = 3) -> None:
    values = list(waste_series)
    if len(values) < 2:
        return
    avg = sum(values) / len(values)
    variance = sum((v - avg) ** 2 for v in values) / (len(values) - 1)
    std_dev = variance**0.5
    if std_dev == 0:
        return
    for value in values:
        z_score = (value - avg) / std_dev
        if abs(z_score) > sigma_limit:
            create_alert(
                db,
                device_id=device.id,
                severity="medium",
                message=f"Waste anomaly detected, value={value:.2f} kg (z={z_score:.2f})",
            )
            break
