import json
import logging
import random
import signal
import sqlite3
import time
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict

import requests
import yaml

from mqtt_client import MqttClient, MqttConfig

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("zerocraftr.edge")


@dataclass
class EdgeConfig:
    device_identifier: str
    factory_id: int
    backend_url: str
    mqtt_host: str
    mqtt_port: int
    poll_interval_seconds: int = 10
    buffer_path: Path = Path(__file__).parent / "buffer.sqlite"

    @staticmethod
    def load(path: Path) -> "EdgeConfig":
        with path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return EdgeConfig(
            device_identifier=data["device"]["identifier"],
            factory_id=data["device"]["factory_id"],
            backend_url=data["backend"]["url"],
            mqtt_host=data["mqtt"]["host"],
            mqtt_port=data["mqtt"]["port"],
            poll_interval_seconds=data.get("poll_interval_seconds", 10),
        )


class BufferStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self._initialize()

    def _initialize(self) -> None:
        with self._connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS telemetry_buffer (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    payload TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def enqueue(self, payload: dict) -> None:
        with self._connection() as conn:
            conn.execute("INSERT INTO telemetry_buffer (payload) VALUES (?)", (json.dumps(payload),))

    def dequeue_all(self) -> list[dict]:
        with self._connection() as conn:
            cursor = conn.execute("SELECT id, payload FROM telemetry_buffer ORDER BY id ASC")
            rows = cursor.fetchall()
            ids = [row[0] for row in rows]
            payloads = [json.loads(row[1]) for row in rows]
            if ids:
                conn.executemany("DELETE FROM telemetry_buffer WHERE id = ?", [(id_,) for id_ in ids])
        return payloads


class EdgeAgent:
    def __init__(self, config: EdgeConfig) -> None:
        self.config = config
        self.buffer = BufferStore(config.buffer_path)
        self.mqtt_client = MqttClient(MqttConfig(config.mqtt_host, config.mqtt_port))
        self.session = requests.Session()
        self._running = True

    def _collect_sensor_data(self) -> dict[str, Any]:
        """
        Simulate retrieving data from connected sensors.
        Replace this block with actual sensor integrations for production deployments.
        """
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        payload = {
            "device_identifier": self.config.device_identifier,
            "timestamp": timestamp,
            "metric": "power",
            "value": round(random.uniform(800, 1600), 2),
            "unit": "W",
        }
        logger.debug("Collected payload %s", payload)
        return payload

    def _flush_buffer(self) -> None:
        queued = self.buffer.dequeue_all()
        if not queued:
            return
        logger.info("Flushing %s buffered payload(s)", len(queued))
        for payload in queued:
            self._publish(payload)

    def _publish(self, payload: dict[str, Any]) -> None:
        buffered = False
        try:
            self.mqtt_client.publish(self.config.device_identifier, payload)
            logger.info("Published telemetry via MQTT")
        except Exception as exc:
            logger.warning("MQTT publish failed (%s). Buffering payload.", exc)
            self.buffer.enqueue(payload)
            buffered = True

        try:
            response = self.session.post(f"{self.config.backend_url}/telemetry", json=payload, timeout=5)
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.warning("REST fallback failed (%s).", exc)
            if not buffered:
                self.buffer.enqueue(payload)

    def start(self) -> None:
        logger.info("Starting ZeroCraftr Edge agent")
        self.mqtt_client.connect()
        self._flush_buffer()
        while self._running:
            payload = self._collect_sensor_data()
            self._publish(payload)
            time.sleep(self.config.poll_interval_seconds)

    def stop(self) -> None:
        logger.info("Stopping edge agent")
        self._running = False
        self.mqtt_client.close()
        self.session.close()


def main() -> None:
    config_path = Path(__file__).parent / "config.yaml"
    config = EdgeConfig.load(config_path)
    agent = EdgeAgent(config)

    def _handle_signal(signum, frame):
        logger.info("Received signal %s, shutting down.", signum)
        agent.stop()

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)
    agent.start()


if __name__ == "__main__":
    main()
