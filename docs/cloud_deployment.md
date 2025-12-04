# ZeroCraftr Cloud Deployment Guide

This guide explains how to deploy ZeroCraftr to a cloud environment (AWS is used as the primary example, but concepts apply to Azure/GCP).

## 1. Prerequisites

-   **Cloud Account**: AWS Account (or Azure/GCP).
-   **CLI Tools**: `aws`, `kubectl`, `helm`, `docker`.
-   **Domain Name**: (Optional) for public access.

## 2. Infrastructure Setup

### Option A: Kubernetes (EKS/AKS/GKE) - Recommended for Production

1.  **Create Cluster**:
    ```bash
    eksctl create cluster --name zerocraftr-prod --region us-east-1 --nodegroup-name standard-workers --node-type t3.medium --nodes 3
    ```

2.  **Database (Managed RDS vs. In-Cluster)**:
    *   **Production**: Use **AWS RDS for PostgreSQL**.
        *   Enable TimescaleDB extension in RDS parameter group.
    *   **Dev/Test**: Use the in-cluster TimescaleDB container (as defined in `infra/k8s/db.yaml`).

3.  **Container Registry (ECR)**:
    *   Create repositories for `zerocraftr-backend`, `zerocraftr-frontend`, `zerocraftr-ml`.
    *   Push your Docker images:
        ```bash
        aws ecr get-login-password | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
        docker build -t zerocraftr-backend ./backend
        docker tag zerocraftr-backend <repo_url>:latest
        docker push <repo_url>:latest
        # Repeat for frontend and ml-system
        ```

## 3. Secrets Management

**"How do I get these secrets?"**

In the cloud, you don't use a `.env` file. You use **Secrets Managers**.

### AWS Secrets Manager / Parameter Store
1.  Go to AWS Console -> Systems Manager -> Parameter Store.
2.  Create parameters:
    *   `/zerocraftr/prod/SECRET_KEY` (SecureString)
    *   `/zerocraftr/prod/DB_PASSWORD` (SecureString)

### Kubernetes Secrets
Inject these into your cluster:

```bash
kubectl create secret generic zerocraftr-secrets \
  --from-literal=SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 16) \
  --from-literal=SQLALCHEMY_DATABASE_URI=postgresql+asyncpg://postgres:$(kubectl get secret zerocraftr-secrets -o jsonpath="{.data.POSTGRES_PASSWORD}" | base64 -d)@db-service:5432/zerocraftr
```

## 4. Deployment

1.  **Update Manifests**:
    *   Edit `infra/k8s/*.yaml` to point to your ECR image URLs.
    *   Update `env` sections to reference the Kubernetes Secret created above.

    ```yaml
    env:
      - name: SECRET_KEY
        valueFrom:
          secretKeyRef:
            name: zerocraftr-secrets
            key: SECRET_KEY
    ```

2.  **Apply Manifests**:
    ```bash
    kubectl apply -f infra/k8s/
    ```

3.  **Ingress (Load Balancer)**:
    *   Deploy an Nginx Ingress Controller or use AWS ALB Controller to expose the `frontend` service to the internet.

## 5. CI/CD Pipeline (GitHub Actions)

The `.github/workflows/ci.yml` should be updated to:
1.  Build Docker images on push to `main`.
2.  Push to ECR.
3.  Update the Kubernetes deployment (using `kubectl set image` or Helm).

## 6. Monitoring

-   **CloudWatch**: Set up for logs.
-   **Prometheus/Grafana**: Install via Helm for metric monitoring.
