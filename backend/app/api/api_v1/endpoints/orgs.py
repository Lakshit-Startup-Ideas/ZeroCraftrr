from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.db.session import get_db
from app.models.org import Organization
from app.schemas.org import Org, OrgCreate, OrgUpdate

router = APIRouter()

@router.get("/", response_model=List[Org])
async def read_orgs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Organization).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=Org)
async def create_org(
    *,
    db: AsyncSession = Depends(get_db),
    org_in: OrgCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    org = Organization(name=org_in.name)
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org
