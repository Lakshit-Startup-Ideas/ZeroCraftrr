from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.db.session import get_db
from app.models.site import Site
from app.schemas.site import Site, SiteCreate

router = APIRouter()

@router.get("/", response_model=List[Site])
async def read_sites(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Site).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=Site)
async def create_site(
    *,
    db: AsyncSession = Depends(get_db),
    site_in: SiteCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    site = Site(
        name=site_in.name,
        organization_id=site_in.organization_id
    )
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return site
