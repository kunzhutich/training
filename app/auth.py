import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, Header

from app.models.enums import Role
from app.models.exceptions import AuthenticationError, AuthorizationError

load_dotenv()

_JWT_SECRET = os.getenv("JWT_SECRET_KEY")
_JWT_ALGORITHM = "HS256"
_TOKEN_TTL = timedelta(hours=8)

if not _JWT_SECRET:
    raise RuntimeError("JWT_SECRET_KEY is not set. Add it to a .env file at the project root.")


@dataclass
class Principal:
    id: str
    role: Role


def create_access_token(subject_id: str, role: Role) -> str:
    payload = {
        "sub": subject_id,
        "role": role.value,
        "exp": datetime.now(timezone.utc) + _TOKEN_TTL,
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


def get_current_principal(authorization: Optional[str] = Header(default=None)) -> Principal:
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("Missing or invalid authorization header.")

    token = authorization[len("Bearer ") :]
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise AuthenticationError("Invalid or expired token.")

    return Principal(id=payload["sub"], role=Role(payload["role"]))


def require_admin(principal: Principal = Depends(get_current_principal)) -> Principal:
    if principal.role != Role.ADMIN:
        raise AuthorizationError("Admin privileges required.")
    return principal


def require_self_or_admin(principal: Principal, resource_owner_id: str) -> None:
    if principal.role != Role.ADMIN and principal.id != resource_owner_id:
        raise AuthorizationError("You do not have access to this resource.")
