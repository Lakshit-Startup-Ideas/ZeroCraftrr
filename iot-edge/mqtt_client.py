import json
import logging
from dataclasses import dataclass
from typing import Callable

import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)


@dataclass
class MqttConfig:
    broker_host: str
    broker_port: int
    topic_prefix: str = "zerocraftr/telemetry"


class MqttClient:
    def __init__(self, config: MqttConfig, on_connect: Callable[[mqtt.Client], None] | None = None) -> None:
        self.config = config
        self.client = mqtt.Client()
        self.client.on_connect = self._handle_connect
        self.client.on_disconnect = self._handle_disconnect
        self._on_connect_cb = on_connect

    def _handle_connect(self, client: mqtt.Client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to MQTT broker %s:%s", self.config.broker_host, self.config.broker_port)
            if self._on_connect_cb:
                self._on_connect_cb(client)
        else:
            logger.error("Failed to connect to MQTT broker. Code: %s", rc)

    def _handle_disconnect(self, client: mqtt.Client, userdata, rc):
        logger.warning("Disconnected from MQTT broker with code %s", rc)

    def connect(self) -> None:
        self.client.connect(self.config.broker_host, self.config.broker_port)
        self.client.loop_start()

    def publish(self, device_identifier: str, payload: dict) -> None:
        topic = f"{self.config.topic_prefix}/{device_identifier}"
        self.client.publish(topic, json.dumps(payload))

    def close(self) -> None:
        self.client.loop_stop()
        self.client.disconnect()
