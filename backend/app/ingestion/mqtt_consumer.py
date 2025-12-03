import json
import logging
from fastapi_mqtt import FastMQTT, MQTTConfig
from pydantic import ValidationError
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.services.telemetry_service import TelemetryService
from app.schemas.telemetry import TelemetryCreate

logger = logging.getLogger(__name__)

mqtt_config = MQTTConfig(
    host=settings.MQTT_BROKER_HOST,
    port=settings.MQTT_BROKER_PORT,
    keepalive=60,
    username=None, 
    password=None
)

fast_mqtt = FastMQTT(config=mqtt_config)

@fast_mqtt.on_connect()
def connect(client, flags, rc, properties):
    logger.info(f"Connected to MQTT Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
    fast_mqtt.client.subscribe("telemetry/+")

@fast_mqtt.on_message()
async def message(client, topic, payload, qos, properties):
    try:
        device_id = topic.split("/")[-1]
        payload_str = payload.decode()
        
        logger.debug(f"Received message from {device_id}: {payload_str}")
        
        try:
            data = json.loads(payload_str)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from {device_id}: {payload_str}")
            return

        # Validate Schema
        try:
            telemetry_data = TelemetryCreate(device_id=device_id, **data)
        except ValidationError as e:
            logger.error(f"Schema validation failed for {device_id}: {e}")
            return

        async with AsyncSessionLocal() as db:
            success = await TelemetryService.process_telemetry(db, device_id, telemetry_data.model_dump())
            if not success:
                logger.warning(f"Failed to process telemetry for {device_id} (Device might not exist)")
            
    except Exception as e:
        logger.error(f"Unexpected error processing MQTT message: {e}")
