# ZeroCraftr API Reference

## Authentication
- **POST** `/api/v1/auth/signup`
  - Body: `{ "email": str, "password": str (>=8) }`
  - Response: `{ id, email }`
- **POST** `/api/v1/auth/login`
  - Form data (`application/x-www-form-urlencoded`): `username`, `password`
  - Response: `{ access_token, token_type }`
  - Use `Authorization: Bearer <token>` for protected endpoints.

## Device Management
- **POST** `/api/v1/devices/factories`
  - Create factory owned by authenticated user.
  - Body: `{ name, location? }`
- **GET** `/api/v1/devices/factories`
  - List user factories.
- **POST** `/api/v1/devices`
  - Register IoT device.
  - Body: `{ identifier, name, type: "energy"|"waste", factory_id }`
- **GET** `/api/v1/devices`
  - List devices with metadata.

## Telemetry
- **POST** `/api/v1/telemetry`
  - Ingest telemetry sample.
  - Body: `{ device_identifier, timestamp (ISO), metric, value, unit }`
  - Supported metrics: `power` (W), `waste_mass` (kg)
- **GET** `/api/v1/telemetry/summary?last_hours=24`
  - Returns aggregated metrics `{ total_energy_kwh, total_co2_kg, total_waste_kg, total_waste_co2_kg }`
  - Caches results in Redis for 60 seconds when available.

## Health
- **GET** `/healthz` ? `{ status: "ok" }`
- **GET** `/api/v1/openapi.json` ? Auto-generated schema (FastAPI).

## AI Integration (`/api/v2`)
- **POST** `/api/v2/forecast/combined`
  - Body: `{ site_id, horizon_hours?, lookback_hours? }` (telemetry auto-hydrated by backend)
  - Response: `{ points: [{ timestamp, prediction, lower, upper, components }], metrics: { mae, mape }, recent_actuals: [...] }`
- **POST** `/api/v2/optimize`
  - Body: `{ site_id, lambda_weight?, equipment: [{ name, load_pct, runtime_hours, idle_hours }] }`
  - Response: `{ objective, baseline_objective, savings_pct, recommended: [...] }`
- **POST** `/api/v2/insights`
  - Body: `{ site_id, energy_summary, forecast_summary, optimization_summary }`
  - Response: `{ insight, confidence, generated_at }`
- **POST** `/api/v2/models/retrain`
  - Body: `{ site_id, telemetry?, equipment? }` (optional because backend sends telemetry automatically)
  - Response: `{ forecast_mae, forecast_mape, optimization_objective }`
- **GET** `/api/v2/models/list`
  - Response: `{ models: [{ model_name, version, accuracy, path, created_at }] }`

All `/api/v2/*` endpoints require Bearer JWT tokens and bridge to dedicated AI microservices (forecast, optimize, insights, retrain). Prometheus metrics are exposed via `/metrics` on each service.

## AI Microservices (internal)
- **Forecast Service (`ai-forecast`, port 9001)** — `POST /api/v2/forecast/combined`, aggregates LSTM + Prophet + RandomForest ensemble.
- **Optimization Service (`ai-optimize`, port 9002)** — `POST /api/v2/optimize`, returns equipment recommendations.
- **Insight Service (`ai-insights`, port 9003)** — `POST /api/v2/insights`, produces transformer-based guidance.
- **Retraining Service (`ai-retrain`, port 9004)** — `POST /api/v2/models/retrain`, `GET /api/v2/models/list`, and exposes `/metrics`. Nightly CronJob runs `python -m services.retrain_worker`.

## Error Handling
- Standard JSON problem details: `{ "detail": str }`
- `401 Unauthorized` for missing/invalid tokens.
- `404 Not Found` when resources belong to another user or do not exist.
- `422 Unprocessable Entity` for validation errors.

## Pagination & Filtering
- MVP exposes basic list endpoints; filters and pagination planned for future release.
