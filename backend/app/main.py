from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api_v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Import and include ingestion router
from app.ingestion.http_ingest import router as ingestion_router
app.include_router(ingestion_router, prefix="/api/ingestion", tags=["ingestion"])

# Initialize MQTT
from app.ingestion.mqtt_consumer import fast_mqtt
fast_mqtt.init_app(app)

@app.get("/")
def root():
    return {"message": "Welcome to ZeroCraftr API"}
