from fastapi import APIRouter, Depends, status

from app.auth import Principal, require_admin
from app.dependencies import get_branch_service
from app.schemas.branch import BranchCreateRequest, BranchResponse
from app.services.branch_service import BranchService

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])


@router.get("", response_model=list[BranchResponse])
def list_branches(service: BranchService = Depends(get_branch_service)) -> list[BranchResponse]:
    return [BranchResponse(branch_code=b.branch_code, name=b.name) for b in service.list_branches()]


@router.post("", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(
    payload: BranchCreateRequest,
    service: BranchService = Depends(get_branch_service),
    _: Principal = Depends(require_admin),
) -> BranchResponse:
    branch = service.create_branch(payload.branch_code, payload.name)
    return BranchResponse(branch_code=branch.branch_code, name=branch.name)
