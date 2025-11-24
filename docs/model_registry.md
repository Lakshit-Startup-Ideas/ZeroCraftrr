# Model Registry Notes

ZeroCraftr stores every AI artifact inside `models_registry.db`, which is managed by the retraining microservice.

## Versioning

- Versions follow the timestamp pattern `YYYYMMDDHHMMSS`.
- Forecast artifacts contain LSTM weights (`*.pt`), RandomForest estimators (`*.joblib`), and Prophet seasonality payloads.
- Optimization runs persist recommended configurations as JSON for reproducibility.

## Encryption

- Model binaries uploaded to MinIO use SSE-C with an AES-256 key derived from `AI_MINIO_SSE_KEY`.
- The local SQLite registry is persisted when deployed via Helm/Docker through the `models_registry` volume/PVC.

## Manual Retraining

1. Trigger `POST /api/v2/models/retrain` (or use the Model Center page).
2. Monitor Prometheus metric `forecast_latency_seconds` plus Grafana dashboard `docs/grafana/ai-latency-dashboard.json`.
3. Validate registry entries by calling `GET /api/v2/models/list`.
