import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)
    
    async with engine.begin() as conn:
        logger.info("Initializing TimescaleDB features...")
        
        # 1. Enable TimescaleDB extension (usually done in Docker image, but good to check)
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
        
        # 2. Convert telemetry table to hypertable
        # Note: This assumes the table is already created by SQLAlchemy models
        try:
            await conn.execute(text("SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);"))
            logger.info("Hypertable 'telemetry' configured.")
        except Exception as e:
            logger.warning(f"Hypertable creation warning: {e}")

        # 3. Create Continuous Aggregate: Hourly
        await conn.execute(text("""
            CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1h
            WITH (timescaledb.continuous) AS
            SELECT 
                time_bucket('1 hour', time) AS bucket,
                device_id,
                AVG(temperature) as avg_temp,
                MAX(temperature) as max_temp,
                MIN(temperature) as min_temp,
                AVG(pressure) as avg_pressure,
                AVG(vibration) as avg_vibration,
                SUM(power_usage) as total_power
            FROM telemetry
            GROUP BY bucket, device_id;
        """))
        logger.info("Continuous Aggregate 'telemetry_1h' created.")

        # 4. Add Refresh Policy for Hourly Aggregate
        # Refresh last 3 days of data every hour
        try:
            await conn.execute(text("""
                SELECT add_continuous_aggregate_policy('telemetry_1h',
                    start_offset => INTERVAL '3 days',
                    end_offset => INTERVAL '1 hour',
                    schedule_interval => INTERVAL '1 hour',
                    if_not_exists => TRUE);
            """))
            logger.info("Refresh policy for 'telemetry_1h' added.")
        except Exception as e:
            logger.warning(f"Policy creation warning: {e}")

        # 5. Set Retention Policy (e.g., keep raw data for 30 days)
        try:
            await conn.execute(text("""
                SELECT add_retention_policy('telemetry', INTERVAL '30 days', if_not_exists => TRUE);
            """))
            logger.info("Retention policy added.")
        except Exception as e:
            logger.warning(f"Retention policy warning: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
