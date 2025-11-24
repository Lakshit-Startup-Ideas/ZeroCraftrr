from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.deps import get_current_user
from ...db import models
from ...db.session import get_db
from ...services.aggregator import summarize_telemetry
from ...services.alerts import evaluate_energy_threshold, evaluate_waste_spike
from ...services.emission import waste_to_co2
from ...utils.cache import cache_get, cache_set
from ...utils.identifiers import hash_identifier
from .schemas import AggregatedMetrics, TelemetryCreate, TelemetryResponse

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def ingest(payload: TelemetryCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    hashed_identifier = hash_identifier(payload.device_identifier)
    query = db.query(models.Device).join(models.Site)
    if user.organization_id:
        query = query.filter(models.Site.org_id == user.organization_id)
    device = query.filter(models.Device.identifier == hashed_identifier).first()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    telemetry = models.Telemetry(
        device_id=device.id,
        timestamp=payload.timestamp,
        metric=payload.metric,
        value=payload.value,
        unit=payload.unit,
    )
    device.last_seen_at = datetime.utcnow()
    db.add(telemetry)

    if payload.metric == "waste_mass" and payload.unit == "kg":
        co2e = waste_to_co2(payload.value)
        waste_record = models.WasteRecord(
            device_id=device.id,
            timestamp=payload.timestamp,
            waste_type="general",
            mass_kg=payload.value,
            co2e_kg=co2e,
        )
        db.add(waste_record)

    db.commit()
    db.refresh(telemetry)

    cache_key = f"summary:{user.id}"
    cache_set(cache_key, None, ttl_seconds=1)  # bust cache
    return telemetry


@router.get("/summary", response_model=AggregatedMetrics)
def summarize(last_hours: int = 24, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    cache_key = f"summary:{user.id}:{last_hours}"
    cached = cache_get(cache_key)
    if cached:
        return AggregatedMetrics(**cached)

    since = datetime.utcnow() - timedelta(hours=last_hours)
    records_query = db.query(models.Telemetry).join(models.Device).join(models.Site).filter(models.Telemetry.timestamp >= since)
    if user.organization_id:
        records_query = records_query.filter(models.Site.org_id == user.organization_id)
    records = records_query.all()
    payloads = [
        {
            "metric": rec.metric,
            "value": rec.value,
            "unit": rec.unit,
            "timestamp": rec.timestamp,
        }
        for rec in records
    ]

    totals = summarize_telemetry(payloads)

    # Evaluate simple rule-based alerts
    energy_threshold = 100.0  # kWh threshold example
    for device in {rec.device for rec in records}:
        device_records = [rec for rec in records if rec.device_id == device.id and rec.metric == "power"]
        samples = [
            {"metric": rec.metric, "value": rec.value, "unit": rec.unit, "timestamp": rec.timestamp}
            for rec in device_records
        ]
        device_totals = summarize_telemetry(samples)
        evaluate_energy_threshold(db, device, device_totals["total_energy_kwh"], energy_threshold)

        waste_values = [rec.value for rec in records if rec.device_id == device.id and rec.metric == "waste_mass"]
        evaluate_waste_spike(db, device, waste_values)

    cache_set(cache_key, totals, ttl_seconds=60)
    return AggregatedMetrics(**totals)
