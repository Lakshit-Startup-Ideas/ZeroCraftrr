from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...api.deps import get_current_user, require_role
from ...db import models
from ...db.session import get_db
from ...utils.identifiers import hash_identifier
from .schemas import (
    Device,
    DeviceCreate,
    DeviceUpdate,
    Factory,
    FactoryCreate,
    Organization,
    OrganizationCreate,
    Site,
    SiteCreate,
)

router = APIRouter(prefix="/devices", tags=["devices"])


def _ensure_user_org(db: Session, user: models.User) -> int:
    if user.organization_id:
        return user.organization_id
    org = models.Organization(name=f"org-{user.id}-{int(datetime.utcnow().timestamp())}")
    db.add(org)
    db.commit()
    db.refresh(org)
    user.organization_id = org.id
    db.add(user)
    db.commit()
    return org.id


@router.post("/factories", response_model=Factory, status_code=status.HTTP_201_CREATED)
def create_factory(
    payload: FactoryCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    org_id = _ensure_user_org(db, user)
    site = models.Site(name=payload.name, location=payload.location, org_id=org_id)
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.get("/factories", response_model=List[Factory])
def list_factories(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Site)
    if user.organization_id:
        query = query.filter(models.Site.org_id == user.organization_id)
    return query.order_by(models.Site.id).all()


@router.post("/organizations", response_model=Organization, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role(["admin"])),
):
    existing = db.query(models.Organization).filter(models.Organization.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization already exists")
    organization = models.Organization(name=payload.name)
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


@router.get("/organizations", response_model=List[Organization])
def list_organizations(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Organization)
    if user.organization_id:
        query = query.filter(models.Organization.id == user.organization_id)
    return query.all()


@router.post("/sites", response_model=Site, status_code=status.HTTP_201_CREATED)
def create_site(
    payload: SiteCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(["admin", "manager"])),
):
    org = db.query(models.Organization).filter(models.Organization.id == payload.org_id).first()
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    site = models.Site(name=payload.name, location=payload.location, org_id=org.id)
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.get("/sites", response_model=List[Site])
def list_sites(
    org_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Site)
    if org_id:
        query = query.filter(models.Site.org_id == org_id)
    if user.organization_id:
        query = query.filter(models.Site.org_id == user.organization_id)
    return query.all()


@router.post("", response_model=Device, status_code=status.HTTP_201_CREATED)
def register_device(
    payload: DeviceCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.id == payload.site_id).first()
    if site is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    hashed_identifier = hash_identifier(payload.identifier)
    existing = db.query(models.Device).filter(models.Device.identifier == hashed_identifier).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device identifier already in use")

    device = models.Device(
        identifier=hashed_identifier,
        name=payload.name,
        type=payload.type,
        site_id=site.id,
        owner_id=payload.owner_id,
        metadata_json=payload.metadata_json,
        last_seen_at=datetime.utcnow(),
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("", response_model=List[Device])
def list_devices(
    site_id: Optional[int] = Query(None, alias="factory_id"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Device).join(models.Site)
    if user.organization_id:
        query = query.filter(models.Site.org_id == user.organization_id)
    if site_id:
        query = query.filter(models.Device.site_id == site_id)
    return query.all()


@router.patch("/{device_id}", response_model=Device)
def update_device(
    device_id: int,
    payload: DeviceUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(["admin", "manager"])),
):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if payload.name is not None:
        device.name = payload.name
    if payload.metadata_json is not None:
        device.metadata_json = payload.metadata_json
    db.commit()
    db.refresh(device)
    return device
