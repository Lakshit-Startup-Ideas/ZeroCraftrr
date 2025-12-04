# ZeroCraftr Free Tier Deployment Guide

This guide explains how to deploy the full ZeroCraftr stack for **free** (or with generous free tiers) using modern cloud platforms.

## Architecture for Free Deployment

-   **Frontend**: **Vercel** (Free for hobby projects).
-   **Backend**: **Render** (Free Web Service tier).
-   **Database**: **Neon** (Free Serverless Postgres) OR **Timescale Cloud** (30-day trial).
    *   *Note*: Standard free Postgres (Neon/Supabase) may not support the `timescaledb` extension. For a permanent free solution with TimescaleDB, you would need a free VM (Oracle Cloud Always Free) to run the Docker container.
-   **MQTT Broker**: **HiveMQ Cloud** (Free up to 100 connections).

---

## 1. Database Setup (Neon - Standard Postgres)

Since running TimescaleDB for free indefinitely is difficult, we will use **Neon** (Postgres). *Note: You may need to disable the specific `create_hypertable` calls in `init_db.py` if the extension is not available.*

1.  Go to [Neon.tech](https://neon.tech) and sign up.
2.  Create a project named `zerocraftr`.
3.  Copy the **Connection String** (e.g., `postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/zerocraftr?sslmode=require`).

## 2. MQTT Broker Setup (HiveMQ)

1.  Go to [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/) and sign up for the Free plan.
2.  Create a cluster.
3.  Create a **User** (username/password) for your devices/backend.
4.  Copy the **Cluster URL** (e.g., `abc1234.s1.eu.hivemq.cloud`) and **Port** (usually `8883` for SSL).

## 3. Backend Deployment (Render)

1.  Push your code to **GitHub**.
2.  Go to [Render.com](https://render.com) and sign up.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
6.  **Environment Variables** (Add these):
    *   `PYTHON_VERSION`: `3.11.0`
    *   `SQLALCHEMY_DATABASE_URI`: (Paste your Neon Connection String)
    *   `MQTT_BROKER_HOST`: (Your HiveMQ URL)
    *   `MQTT_BROKER_PORT`: `8883`
    *   `SECRET_KEY`: (Generate a random string)
    *   `BACKEND_CORS_ORIGINS`: `["https://your-frontend-app.vercel.app"]` (You will update this later).
7.  Click **Create Web Service**.
8.  Copy your Backend URL (e.g., `https://zerocraftr-backend.onrender.com`).

## 4. Frontend Deployment (Vercel)

1.  Go to [Vercel.com](https://vercel.com) and sign up.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Framework Preset**: Vite (should detect automatically).
5.  **Environment Variables**:
    *   `VITE_API_URL`: `https://zerocraftr-backend.onrender.com/api/v1` (Your Render Backend URL).
    *   `VITE_WS_URL`: `wss://zerocraftr-backend.onrender.com/api/v1/ws/telemetry` (Note: `wss://` for secure WebSocket).
6.  Click **Deploy**.
7.  Copy your Frontend URL (e.g., `https://zerocraftr.vercel.app`).

## 5. Final Configuration

1.  Go back to **Render** (Backend).
2.  Update the `BACKEND_CORS_ORIGINS` environment variable to include your new Vercel URL:
    `["https://zerocraftr.vercel.app"]`
3.  Redeploy the Backend.

## 6. Important Code Adjustments for Free Tier

### Database Compatibility
If using Neon (Standard Postgres), the `init_db.py` script might fail on `CREATE EXTENSION timescaledb`. You might need to comment out the Timescale-specific SQL in `backend/app/db/init_db.py` for the demo to work without errors.

### Frontend API Client
Ensure your `frontend/src/services/api.ts` uses the environment variable:
```typescript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    // ...
});
```

### WebSocket Connection
Ensure `frontend/src/pages/Dashboard.tsx` uses the environment variable:
```typescript
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/telemetry';
const ws = new WebSocket(wsUrl);
```
