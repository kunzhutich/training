from pydantic import BaseModel, Field


class BranchCreateRequest(BaseModel):
    branch_code: str = Field(min_length=1)
    name: str = Field(min_length=1)


class BranchResponse(BaseModel):
    branch_code: str
    name: str
