from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...core.config import get_settings
from ...core.security import create_access_token, get_password_hash, verify_password
from ...db import models
from ...db.session import get_db
from .schemas import Token, User, UserCreate

router = APIRouter(prefix="/auth", tags=["auth"])


def _ensure_role(db: Session, name: str) -> models.Role:
    role = db.query(models.Role).filter(models.Role.name.ilike(name)).first()
    if role is None:
        role = models.Role(name=name.capitalize())
        db.add(role)
        db.commit()
        db.refresh(role)
    return role


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    organization = None
    if payload.organization_id:
        organization = db.query(models.Organization).filter(models.Organization.id == payload.organization_id).first()
        if organization is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    user = models.User(email=payload.email, hashed_password=get_password_hash(payload.password))
    if organization:
        user.organization_id = organization.id
    db.add(user)
    db.commit()
    db.refresh(user)

    default_role_name = payload.role or "viewer"
    role = _ensure_role(db, default_role_name)
    user_role = models.UserRole(user_id=user.id, role_id=role.id, site_scope_id=payload.site_scope_id)
    db.add(user_role)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    roles = []
    site_scopes = []
    for user_role in user.roles:
        role = db.get(models.Role, user_role.role_id)
        if role:
            roles.append(role.name)
        if user_role.site_scope_id:
            site_scopes.append(user_role.site_scope_id)
    claims = {"roles": roles, "site_scope": site_scopes, "org_id": user.organization_id}
    token = create_access_token(user.email, expires_delta=access_token_expires, claims=claims)
    return Token(access_token=token)
