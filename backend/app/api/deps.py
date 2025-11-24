from typing import Callable, Generator, Iterable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core.security import decode_token
from ..db import models
from ..db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db_session() -> Generator[Session, None, None]:
    yield from get_db()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db_session)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    email: str | None = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(allowed_roles: Iterable[str]) -> Callable[..., models.User]:
    allowed = {role.lower() for role in allowed_roles}

    def dependency(
        user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db_session),
    ) -> models.User:
        role_names = set()
        for user_role in user.roles:
            role = db.get(models.Role, user_role.role_id)
            if role:
                role_names.add(role.name.lower())
        if not role_names.intersection(allowed):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency
