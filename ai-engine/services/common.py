from __future__ import annotations

import logging
import os
from typing import Any, Dict

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from starlette.responses import Response

logger = logging.getLogger(__name__)
_bearer = HTTPBearer(auto_error=False)


def _jwt_settings() -> tuple[str, str]:
    secret = os.getenv("AI_JWT_SECRET", "supersecret")
    algorithm = os.getenv("AI_JWT_ALGORITHM", "HS256")
    return secret, algorithm


def require_jwt(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> Dict[str, Any]:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    secret, algorithm = _jwt_settings()
    try:
        token_data = jwt.decode(credentials.credentials, secret, algorithms=[algorithm])
    except jwt.PyJWTError as exc:  # pragma: no cover - cryptographic edge
        logger.warning("Invalid JWT supplied to AI service: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    return token_data


def register_metrics_endpoint(app: FastAPI) -> None:
    @app.get("/metrics")
    def metrics() -> Response:
        payload = generate_latest()
        return Response(content=payload, media_type=CONTENT_TYPE_LATEST)
