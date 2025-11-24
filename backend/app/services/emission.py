from ..core.config import get_settings


def energy_to_co2(energy_kwh: float) -> float:
    """
    Convert energy in kWh to CO2 equivalent using the configured emission factor.
    """
    settings = get_settings()
    return round(energy_kwh * settings.emission_factor, 4)


def waste_to_co2(waste_kg: float, emission_factor: float | None = None) -> float:
    """
    Convert waste mass in kg to CO2 equivalent. If no emission factor explicitly provided,
    use the first configured waste factor.
    """
    settings = get_settings()
    factor = emission_factor if emission_factor is not None else settings.waste_factors[0]
    return round(waste_kg * factor, 4)
