# ZeroCraftr

ZeroCraftr is a production-grade IoT + ML + Dashboard SaaS platform for manufacturing sustainability. It monitors energy consumption, predicts anomalies using LightGBM, and provides real-time insights via a React dashboard.

## Architecture

- **Backend**: FastAPI (Python 3.11)
- **Database**: TimescaleDB (PostgreSQL extension) for time-series data
- **Ingestion**: MQTT (Mosquitto) & HTTP with API Key Auth
- **ML System**: LightGBM for forecasting, MLflow for registry
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Infrastructure**: Docker Compose (Local), Kubernetes (Prod)

## Quick Start

1.  **Clone & Setup**:
    ```bash
    git clone https://github.com/Lakshit-Startup-Ideas/ZeroCraftrr.git
    cd ZeroCraftrr
    cp .env.example .env
    ```

2.  **Run Services**:
    ```bash
    docker-compose up --build
    ```

3.  **Seed Data**:
    ```bash
    docker-compose exec backend python scripts/seed_data.py
    ```

4.  **Access**:
    - **Dashboard**: `http://localhost:3000` (Login: `admin@zerocraftr.com` / `admin123`)
    - **API Docs**: `http://localhost:8000/docs`
    - **MLflow**: `http://localhost:5000`

## Features

- **Real-time Monitoring**: WebSocket-based live telemetry updates.
- **Asset Management**: Organize Devices into Sites and Organizations.
- **Forecasting**: AI-powered predictions for temperature and power usage.
- **Alerts**: Automated anomaly detection and alert management.
- **Secure Ingestion**: API Key authentication for edge devices.

## Development

- **Backend Tests**: `pytest`
- **Frontend Tests**: `npm test`
- **Docs**: See `docs/` for Architecture, Deployment, and Pilot Manuals.
