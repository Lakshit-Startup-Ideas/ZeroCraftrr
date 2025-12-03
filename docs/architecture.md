# ZeroCraftr System Architecture

```mermaid
graph TD
    subgraph "IoT Edge Layer"
        D[Devices / PLC] -->|MQTT| G[IoT Gateway]
        G -->|MQTT| B[Mosquitto Broker]
    end

    subgraph "Backend Layer"
        B -->|Subscribe| I[Ingestion Service]
        I -->|Validate & Normalize| I
        I -->|Write| DB[(TimescaleDB)]
        
        API[FastAPI Backend] -->|Query| DB
        API -->|Auth| DB
        
        W[Aggregation Worker] -->|Continuous Agg| DB
    end

    subgraph "ML Layer"
        T[Training Service] -->|Read History| DB
        T -->|Log Model| R[MLflow Registry]
        P[Inference Service] -->|Load Model| R
        API -->|Request Prediction| P
    end

    subgraph "Frontend Layer"
        UI[React Dashboard] -->|REST API| API
        UI -->|WebSocket| API
    end

    subgraph "Infrastructure"
        K8s[Kubernetes Cluster]
        Docker[Docker Containers]
    end
```

## Component Description

1.  **IoT Gateway**: Edge devices or software pushing telemetry to the broker.
2.  **Mosquitto Broker**: Central message bus for MQTT.
3.  **Ingestion Service**: Python/FastAPI service consuming MQTT topics, validating schemas, and writing to TimescaleDB.
4.  **TimescaleDB**: PostgreSQL extension for time-series data, handling raw telemetry and continuous aggregates.
5.  **FastAPI Backend**: REST API for frontend, handling Auth, CRUD, and data retrieval.
6.  **ML System**:
    *   **Training**: Batch jobs to retrain models.
    *   **Inference**: Real-time optimization recommendations.
7.  **React Dashboard**: User interface for monitoring and management.
