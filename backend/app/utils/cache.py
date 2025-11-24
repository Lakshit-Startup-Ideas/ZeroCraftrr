from __future__ import annotations

import json
from typing import Any

import redis
from redis.exceptions import RedisError

from ..core.config import get_settings

settings = get_settings()
_redis_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
            # Try a lightweight ping to verify availability
            _redis_client.ping()
        except RedisError:
            _redis_client = None
    return _redis_client


def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    client = get_redis()
    if client is None:
        return
    try:
        client.setex(key, ttl_seconds, json.dumps(value, default=str))
    except RedisError:
        # Fallback silently when Redis is unavailable
        return


def cache_get(key: str) -> Any | None:
    client = get_redis()
    if client is None:
        return None
    try:
        stored = client.get(key)
    except RedisError:
        return None
    if stored is None:
        return None
    return json.loads(stored)
