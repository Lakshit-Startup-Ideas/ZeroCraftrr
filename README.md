# ZeroCraftr

ZeroCraftr is an IoT + AI powered sustainability platform that helps manufacturers monitor energy consumption, carbon emissions, and waste output. This MVP delivers a production-ready monorepo with FastAPI backend, React dashboard, AI inference microservice, IoT edge agent, infrastructure automation, and CI/CD pipelines.

## Repository Layout

- `backend/` — FastAPI service, PostgreSQL/Redis integrations, MQTT helpers, and pytest suite
- `frontend/` — Vite + React + Tailwind dashboard with Vitest coverage
- `ai-engine/` — Python microservice for forecasting, anomaly detection, and waste estimation
- `iot-edge/` — Lightweight MQTT-enabled edge agent with offline buffering
- `deployment/` — Docker Compose stack, Kubernetes manifests, and deployment scripts
- `docs/` — SRS, API reference, and architecture documentation
- `deployment/helm/ai/` — Helm chart for forecast/optimizer/insight/retrain microservices
- `docs/grafana/ai-latency-dashboard.json` — Grafana dashboard for AI latency & accuracy
- `docs/model_registry.md` — Model versioning and encryption notes

## Quick Start

1. **Install dependencies**
   - Python 3.12, Node.js 22, Docker 24+
2. **Environment variables**
   - Copy `.env` and adjust secrets before production use.
3. **Run locally with Docker**
   ```bash
   docker-compose up --build
   ```
   Services:
   - Frontend: http://localhost:5173
   - Backend API docs: http://localhost:8000/docs
   - AI Forecast: http://localhost:9101/healthz
   - AI Optimization: http://localhost:9102/healthz
   - AI Insights: http://localhost:9103/healthz
   - AI Retrain: http://localhost:9104/healthz
   - Grafana: http://localhost:3000 (admin/admin)
4. **Run tests**
   ```bash
   pip install -r backend/requirements.txt
   pytest backend/tests

   cd frontend
   npm install
   npm run test
   ```

## Deployment

- **Render (backend)**: configure `RENDER_DEPLOY_HOOK` secret and push to `main` to trigger `.github/workflows/cd.yml`.
- **Vercel (frontend)**: configure `VERCEL_DEPLOY_HOOK` secret to push updates automatically.
- **Helm (AI microservices)**:
  ```bash
  helm install zerocraftr-ai ./deployment/helm/ai -n zerocraftr --create-namespace
  ```
  This deploys forecast/optimization/insight/retrain services, PVC-backed registries, ingress routing, and a nightly CronJob.
- **Kubernetes (legacy stack)**: apply manifests via `deployment/scripts/deploy.sh zerocraftr`.
- **Docker Compose**: `docker compose up --build` runs backend, frontend, IoT edge, Prometheus, Grafana, MinIO, and the four AI microservices.

## Observability

- Prometheus scrapes backend plus every AI service (`/metrics` exposes `forecast_latency_seconds`, `optimizer_suggestions_total`, `insight_generation_time`).
- Grafana dashboard JSON is available at `docs/grafana/ai-latency-dashboard.json`.
- Model registry & retraining events are documented in `docs/model_registry.md`.

## Phase 3 AI Integration Checklist

- ✅ Intelligent Forecast engine (LSTM + Prophet + RandomForest ensemble) with `POST /api/v2/forecast/combined`
- ✅ Bayesian Optimization via Optuna (`POST /api/v2/optimize`)
- ✅ Generative Insight module powered by lightweight transformers (`POST /api/v2/insights`)
- ✅ Continuous retraining pipeline + manual trigger (`POST /api/v2/models/retrain`) and registry (`GET /api/v2/models/list`)
- ✅ React dashboard pages for Forecast, Optimization, AI Insights, and Model Center with Chart.js + D3 visualizations and Toast notifications
- ✅ Dockerfiles per AI microservice, Helm chart, MinIO AES-256 uploads, and CI workflow `.github/workflows/ai-ci.yml`

## Further Reading

- `docs/srs.md` — complete requirements traceability.
- `docs/architecture.md` — component interactions and data flow.
- `docs/api_reference.md` — REST contract for backend and AI services.
