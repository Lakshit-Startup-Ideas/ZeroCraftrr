import json
import logging
from typing import Callable

import paho.mqtt.client as mqtt

from ..core.config import get_settings

logger = logging.getLogger(__name__)


def _default_handler(topic: str, payload: dict) -> None:
    logger.info("Received MQTT message on %s: %s", topic, payload)


def start_client(message_handler: Callable[[str, dict], None] | None = None) -> mqtt.Client:
    settings = get_settings()
    handler = message_handler or _default_handler

    def on_connect(client: mqtt.Client, userdata, flags, rc):
        logger.info("Connected to MQTT broker with result %s", rc)
        client.subscribe("zerocraftr/telemetry/#")

    def on_message(client: mqtt.Client, userdata, msg: mqtt.MQTTMessage):
        try:
            payload = json.loads(msg.payload.decode())
        except json.JSONDecodeError:
            logger.warning("Discarding non-JSON MQTT message: %s", msg.payload)
            return
        handler(msg.topic, payload)

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    broker_url = settings.mqtt_broker_url.replace("mqtt://", "")
    host, port = broker_url.split(":")
    client.connect(host, int(port))
    client.loop_start()
    return client
