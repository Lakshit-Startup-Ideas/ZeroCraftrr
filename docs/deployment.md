# ZeroCraftr Deployment Guide

## Prerequisites
- Docker & Docker Compose (for local)
- Kubernetes Cluster (v1.25+) & Helm (for production)
- PostgreSQL Client (optional)

## Local Development

1.  **Clone Repository**:
    ```bash
    git clone https://github.com/Lakshit-Startup-Ideas/ZeroCraftrr.git
    cd ZeroCraftrr
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` (if not present, create one):
    ```ini
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_DB=zerocraftr
    MQTT_BROKER_HOST=mqtt
    SECRET_KEY=dev_secret
    ```

3.  **Start Services**:
    ```bash
    docker-compose up --build -d
    ```

4.  **Verify Status**:
    ```bash
    docker-compose ps
    ```

5.  **Seed Data**:
    ```bash
    docker-compose exec backend python scripts/seed_data.py
    ```

6.  **Access**:
    - Dashboard: `http://localhost:3000`
    - API Docs: `http://localhost:8000/docs`

## Production Deployment (Kubernetes)

1.  **Build Images**:
    ```bash
    docker build -t registry.example.com/zerocraftr/backend:v1 ./backend
    docker build -t registry.example.com/zerocraftr/frontend:v1 ./frontend
    docker push registry.example.com/zerocraftr/backend:v1
    docker push registry.example.com/zerocraftr/frontend:v1
    ```

2.  **Configure Helm**:
    Edit `infra/helm/zerocraftr/values.yaml` with your registry and secrets.

3.  **Install Chart**:
    ```bash
    helm install zerocraftr ./infra/helm/zerocraftr --namespace zerocraftr --create-namespace
    ```

4.  **Verify**:
    ```bash
    kubectl get pods -n zerocraftr
    ```

## Secrets Management
In production, use Kubernetes Secrets or a Vault solution. Do NOT commit `.env` files.

## Scaling
- **Backend**: Stateless, scale replicas in `values.yaml`.
- **Ingestion**: Scale MQTT consumers based on partition/topic load.
- **Database**: Use Timescale Cloud or managed PostgreSQL for high availability.
