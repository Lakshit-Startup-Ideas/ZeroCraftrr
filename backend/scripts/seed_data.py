import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.models.org import Organization
from app.models.site import Site
from app.models.device import Device
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        logger.info("Seeding data...")

        # 1. Create Admin User
        admin_email = "admin@zerocraftr.com"
        # Check if exists (omitted for brevity, usually needed)
        admin = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_superuser=True
        )
        db.add(admin)

        # 2. Create Organization
        org = Organization(name="Acme Manufacturing")
        db.add(org)
        await db.flush() # Get ID

        # 3. Create Site
        site = Site(name="Factory A", organization_id=org.id)
        db.add(site)
        await db.flush()

        # 4. Create Devices
        devices = [
            Device(name="CNC Machine 1", device_id="cnc-001", site_id=site.id),
            Device(name="Furnace 3", device_id="furnace-003", site_id=site.id),
            Device(name="Conveyor Belt", device_id="conveyor-01", site_id=site.id),
        ]
        db.add_all(devices)
        
        await db.commit()
        logger.info("Seeding complete.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
