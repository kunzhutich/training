from fastapi import APIRouter, Depends, status

from app.auth import create_access_token
from app.dependencies import get_auth_service
from app.models.customer import Customer
from app.schemas.auth import ChangePasswordRequest, LoginRequest, LoginResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    user, role = service.login(payload.username, payload.password)
    branch_code = user.branch_code if isinstance(user, Customer) else None
    token = create_access_token(user.id, role)
    return LoginResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=role,
        branch_code=branch_code,
        access_token=token,
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    service: AuthService = Depends(get_auth_service),
) -> None:
    service.change_password(payload.username, payload.current_password, payload.new_password)
