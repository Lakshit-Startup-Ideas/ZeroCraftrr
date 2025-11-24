from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, status

from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def _request(
    method: str,
    base_url: str,
    path: str,
    payload: Optional[dict[str, Any]] = None,
    token: Optional[str] = None,
) -> Dict[str, Any]:
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    timeout = httpx.Timeout(10.0, connect=5.0)
    url = f"{base_url.rstrip('/')}{path}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.request(method, url, json=payload, headers=headers)
        except httpx.RequestError as exc:
            logger.error("AI engine request to %s failed: %s", url, exc)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service unavailable") from exc
    if response.status_code >= 400:
        logger.warning("AI engine error %s: %s", response.status_code, response.text)
        raise HTTPException(status_code=response.status_code, detail=response.json().get("detail", response.text))
    return response.json()


async def request_forecast(payload: dict[str, Any], token: Optional[str]) -> Dict[str, Any]:
    return await _request("POST", settings.ai_forecast_url, "/api/v2/forecast/combined", payload, token)


async def request_optimization(payload: dict[str, Any], token: Optional[str]) -> Dict[str, Any]:
    return await _request("POST", settings.ai_optimize_url, "/api/v2/optimize", payload, token)


async def request_insight(payload: dict[str, Any], token: Optional[str]) -> Dict[str, Any]:
    return await _request("POST", settings.ai_insights_url, "/api/v2/insights", payload, token)


async def trigger_retrain(payload: dict[str, Any], token: Optional[str]) -> Dict[str, Any]:
    return await _request("POST", settings.ai_retrain_url, "/api/v2/models/retrain", payload, token)


async def fetch_models(token: Optional[str]) -> Dict[str, Any]:
    return await _request("GET", settings.ai_retrain_url, "/api/v2/models/list", None, token)
