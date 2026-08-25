from fastapi import APIRouter, Depends, status

from app.dependencies import get_account_service
from app.schemas.account import AccountCreateRequest, AccountResponse
from app.services.account_service import AccountService

router = APIRouter(prefix="/api/v1/accounts", tags=["accounts"])


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def open_account(
    payload: AccountCreateRequest,
    service: AccountService = Depends(get_account_service),
) -> AccountResponse:
    account = service.open_account(payload.customer_id, payload.account_type, payload.opening_balance)
    return AccountResponse(
        account_number=account.account_number,
        owner_id=account.owner_id,
        account_type=account.account_type,
        balance=account.balance,
    )
