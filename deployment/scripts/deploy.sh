#!/usr/bin/env bash
set -euo pipefail

NAMESPACE=${1:-zerocraftr}

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -n "$NAMESPACE" -f ../k8s/postgres-stateful.yaml
kubectl apply -n "$NAMESPACE" -f ../k8s/redis-deploy.yaml
kubectl apply -n "$NAMESPACE" -f ../k8s/mqtt-deploy.yaml
kubectl apply -n "$NAMESPACE" -f ../k8s/backend-deploy.yaml
kubectl apply -n "$NAMESPACE" -f ../k8s/frontend-deploy.yaml

printf '\nDeployment triggered. Monitor status with: kubectl get pods -n %s\n' "$NAMESPACE"