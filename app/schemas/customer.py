from typing import List, Optional

from pydantic import BaseModel, Field


class CustomerCreateRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    branch_code: str = Field(min_length=1)
    email: str = ""
    phone: str = ""
    address: str = ""


class CustomerUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1)
    branch_code: Optional[str] = Field(default=None, min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(min_length=3)


class CustomerResponse(BaseModel):
    id: str
    username: str
    full_name: str
    branch_code: str
    is_active: bool
    account_numbers: List[str]
    email: str
    phone: str
    address: str
