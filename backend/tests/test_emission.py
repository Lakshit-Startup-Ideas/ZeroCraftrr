from backend.app.services.emission import energy_to_co2, waste_to_co2


def test_energy_to_co2_conversion():
    assert energy_to_co2(10) == 8.2  # 10 kWh * 0.82 kg/kWh


def test_waste_to_co2_default_factor():
    assert waste_to_co2(2) == 5.0  # uses default factor 2.5


def test_waste_to_co2_custom_factor():
    assert waste_to_co2(3, emission_factor=1.1) == 3.3
