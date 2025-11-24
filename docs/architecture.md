# ZeroCraftr Architecture

```
IoT Sensors -> IoT Edge Agent -> MQTT Broker
                           |                                           |                 -> FastAPI Backend -> PostgreSQL
                           |                                   \-> Redis
React Frontend <- FastAPI Backend <- AI Microservices (Forecast / Optimize / Insights / Retrain)
                                       |
                                 Prometheus + MinIO -> Grafana
```

## Components
- **IoT Edge Agent:** Publishes telemetry via MQTT and REST; buffers outages in SQLite.
- **MQTT Broker:** Eclipse Mosquitto container for device messaging.
- **Backend API:** FastAPI app handling auth, device CRUD, telemetry ingestion, aggregation, alerts, and `/api/v2` AI proxy routes.
- **Database Layer:** PostgreSQL for relational data; Redis for caching summaries and event queues.
- **AI Microservices:** Forecast ensemble (Torch + Prophet + RandomForest), Optuna optimizer, transformer insight generator, and retraining/registry pipeline uploading AES-256 encrypted artifacts to MinIO.
- **Frontend:** React dashboard with Forecast, Optimization, AI Insights, and Model Center pages, powered by Chart.js, D3, Axios, and Toast notifications.
- **Monitoring:** Prometheus scrapes backend and every AI service; Grafana dashboard JSON lives at `docs/grafana/ai-latency-dashboard.json`.

## Data Flow
1. Edge agent collects sensor readings and publishes MQTT messages (`zerocraftr/telemetry/<device>`).
2. Backend ingests telemetry (MQTT/REST), hashes device identifiers, and persists records into PostgreSQL.
3. Aggregation services compute kWh and CO2e via the trapezoidal rule and emission factors; results cache in Redis and drive alerts.
4. Backend `/api/v2` routes call the appropriate AI microservice via `ai_bridge.py` with JWT fan-out and Prometheus instrumentation.
5. React client calls `/telemetry/summary`, `/devices`, and the `/api/v2/*` endpoints to render charts, optimization cards, insights, and model registry actions.

## Deployment Pipeline
- **CI (GitHub Actions):** `ci.yml` for backend/frontend plus `ai-ci.yml` for AI regression + Docker builds.
- **CD:** Webhook triggers for Render (backend) and Vercel (frontend); Helm chart (`deployment/helm/ai`) for AI workloads including CronJob and PVC.
- **Runtime:** Docker Compose for local parity (backend, frontend, IoT edge, Prometheus, Grafana, MinIO, AI microservices) and Kubernetes manifests for production.

## Security Considerations
- JWT-based OAuth2 login; passwords hashed with bcrypt; device identifiers SHA-256 hashed before storage.
- AI services require Bearer JWT verification using `AI_JWT_SECRET` and encrypt MinIO uploads via SSE-C AES-256.
- Secrets provided via `.env` locally and Kubernetes secrets/Helm values in production.

## Scaling Strategy
- Backend replicas behind load balancer; PostgreSQL via StatefulSet with PVC; Redis clustered when needed.
- AI microservices scale independently per workload; retraining job backed by PVC for registry persistence.
- Frontend served as static assets via CDN (Vercel) or Nginx container.
- Edge agents independently deployable near factory floor.
