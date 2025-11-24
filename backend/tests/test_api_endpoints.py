from datetime import datetime, timedelta

from fastapi.testclient import TestClient


def test_device_registration_flow(client: TestClient, auth_headers: dict[str, str]):
    factory_payload = {"name": "Plant A", "location": "Berlin"}
    factory_resp = client.post("/api/v1/devices/factories", json=factory_payload, headers=auth_headers)
    assert factory_resp.status_code == 201, factory_resp.text
    factory_id = factory_resp.json()["id"]

    device_payload = {
        "identifier": "dev-123",
        "name": "Main Meter",
        "type": "energy",
        "factory_id": factory_id,
    }
    device_resp = client.post("/api/v1/devices", json=device_payload, headers=auth_headers)
    assert device_resp.status_code == 201, device_resp.text

    telemetry_payloads = [
        {
            "device_identifier": "dev-123",
            "timestamp": datetime.utcnow().isoformat(),
            "metric": "power",
            "value": 1200,
            "unit": "W",
        },
        {
            "device_identifier": "dev-123",
            "timestamp": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "metric": "power",
            "value": 800,
            "unit": "W",
        },
    ]
    for payload in telemetry_payloads:
        response = client.post("/api/v1/telemetry", json=payload, headers=auth_headers)
        assert response.status_code == 201, response.text

    summary_resp = client.get("/api/v1/telemetry/summary", headers=auth_headers)
    assert summary_resp.status_code == 200
    total_energy = summary_resp.json()["total_energy_kwh"]
    assert total_energy > 0


def test_requires_authentication(client: TestClient):
    response = client.get("/api/v1/devices")
    assert response.status_code == 401
