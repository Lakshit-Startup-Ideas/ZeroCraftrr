from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration loaded from environment variables.
    Defaults support local development via the repository-level .env file.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = "ZeroCraftr Backend"
    api_v1_prefix: str = "/api/v1"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str
    redis_url: str
    mqtt_broker_url: str
    minio_endpoint: str = "http://minio:9000"
    minio_access_key: str = "minio"
    minio_secret_key: str = "minio123"
    minio_bucket_reports: str = "zerocraftr-reports"
    smtp_server: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    alert_webhook_url: str | None = None
    ai_engine_url: str = "http://ai-engine:9000"
    ai_forecast_url: str = "http://ai-forecast:9001"
    ai_optimize_url: str = "http://ai-optimize:9002"
    ai_insights_url: str = "http://ai-insights:9003"
    ai_retrain_url: str = "http://ai-retrain:9004"
    slack_bot_token: str | None = None

    emission_factor: float = 0.82  # kg CO2e per kWh
    waste_factors: List[float] = [2.5, 1.5, 0.5]  # placeholder emission factors by waste type


@lru_cache
def get_settings() -> Settings:
    return Settings()
