# ZeroCraftr Software Requirements Specification

## 1. Overview
- **Purpose:** Provide SMEs with energy, emissions, and waste monitoring.
- **Scope:** Backend API, frontend dashboard, AI inference service, IoT edge agent, deployable via Docker/Kubernetes.
- **Users:** Sustainability managers, factory operators, data analysts.

## 2. Functional Requirements
| ID | Title | Description | Implementation |
| --- | --- | --- | --- |
| FR-1 | Device Registration | Register, list, update IoT devices | `backend/app/api/v1/devices.py` |
| FR-2 | Data Ingestion | Accept telemetry via MQTT/REST | MQTT broker + `/api/v1/telemetry` |
| FR-3 | Energy & CO2e Calculation | Integrate watt readings to kWh ? CO2e | `aggregator.integrate_energy`, `emission.energy_to_co2` |
| FR-4 | Waste Tracking | Record waste and convert to CO2e | `/telemetry` waste branch + `waste_to_co2` |
| FR-5 | Alerts & Insights | Rule-based + anomaly detection | `services/alerts.py`, AI engine `/detect/anomalies` |
| FR-6 | Reporting | ESG-compliant reports | Frontend `Reports` page + API exports (placeholder) |
| FR-7 | Forecasting | Predict next-day energy | AI engine `/forecast/energy` |

## 3. Non-Functional Requirements
- **Performance:** Backend endpoints covered by pytest; optimized SQLAlchemy usage; async-ready architecture.
- **Security:** OAuth2 password flow with JWT, hashed passwords, configurable secrets.
- **Availability:** Docker/K8s manifests with replica sets; health probes.
- **Scalability:** Stateless backend with Redis cache; horizontal pods in K8s.
- **Maintainability:** Monorepo structure, lint/test workflows, typed code.
- **Compliance:** Emission factors align with GHG protocol defaults; reporting templates extendable for ISO 14001.

## 4. System Architecture Summary
- **Backend:** FastAPI + PostgreSQL + Redis + MQTT integration.
- **AI Engine:** Torch/Sklearn models exposed via FastAPI microservice.
- **Frontend:** React + Tailwind + Recharts dashboard.
- **Edge Agent:** MQTT publisher with REST fallback + SQLite buffer.
- **Infra:** Docker Compose stack, Kubernetes manifests, GitHub Actions CI/CD.

## 5. Data Model Snapshot
- **User** (id, email, hashed_password)
- **Factory** (id, name, location, owner_id)
- **Device** (id, identifier, name, type, factory_id, last_seen_at)
- **Telemetry** (id, device_id, timestamp, metric, value, unit)
- **WasteRecord** (id, device_id, timestamp, waste_type, mass_kg, co2e_kg)
- **Alert** (id, device_id, severity, message, created_at, resolved_at)

## 6. External Interfaces
- **MQTT:** Topic `zerocraftr/telemetry/<deviceId>`
- **REST API:** `/api/v1/` prefix; OpenAPI available at `/docs`.
- **AI Engine API:** `/forecast/energy`, `/detect/anomalies`, `/estimate/waste`.

## 7. Constraints & Assumptions
- PostgreSQL 16+, Redis 7+, MQTT broker (Eclipse Mosquitto).
- AI models ship with seeded weights; retraining pipeline out-of-scope for MVP.
- IoT agent simulates sensor reads; replace with field integrations for production.

## 8. Verification & Validation
- Unit tests for energy/emission formulas & API flows.
- Vitest coverage on core UI components.
- GitHub Actions pipeline executes tests and docker-compose build.

## 9. Future Enhancements
- Replace simulated edge data with Modbus/OPC-UA connectors.
- Add streaming pipeline (Kafka) for high-throughput ingestion.
- Expand AI engine with automated retraining and drift monitoring.
- Build Grafana dashboards for KPIs and alerts KPIs.