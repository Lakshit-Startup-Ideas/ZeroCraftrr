from datetime import datetime, timedelta

from backend.app.services.aggregator import PowerSample, integrate_energy


def test_integrate_energy_trapezoidal():
    base = datetime.utcnow()
    samples = [
        PowerSample(timestamp=base, watts=1000),
        PowerSample(timestamp=base + timedelta(hours=1), watts=1500),
        PowerSample(timestamp=base + timedelta(hours=2), watts=500),
    ]
    energy = integrate_energy(samples)
    expected = (
        ((1000 + 1500) / 2) * 1  # first hour
        + ((1500 + 500) / 2) * 1  # second hour
    ) / 1000
    assert abs(energy - expected) < 1e-6


def test_integrate_with_insufficient_samples():
    energy = integrate_energy([])
    assert energy == 0.0
