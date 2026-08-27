from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import Role


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    id: str
    username: str
    full_name: str
    role: Role
    branch_code: Optional[str] = None
    access_token: str


class ChangePasswordRequest(BaseModel):
    username: str
    current_password: str
    new_password: str = Field(min_length=6)
