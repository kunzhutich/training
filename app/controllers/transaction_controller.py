from fastapi import APIRouter, Depends, status

from app.auth import Principal, get_current_principal, require_self_or_admin
from app.dependencies import get_account_service, get_transaction_service
from app.schemas.account import AccountResponse
from app.schemas.transaction import TransferRequest, TransferResponse
from app.services.account_service import AccountService
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.post("/transfer", response_model=TransferResponse, status_code=status.HTTP_200_OK)
def transfer(
    payload: TransferRequest,
    transaction_service: TransactionService = Depends(get_transaction_service),
    account_service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> TransferResponse:
    source_account = account_service.get_account(payload.from_account_number)
    require_self_or_admin(principal, source_account.owner_id)

    from_account, to_account = transaction_service.transfer(
        payload.from_account_number, payload.to_account_number, payload.amount
    )
    return TransferResponse(
        from_account=AccountResponse(
            account_number=from_account.account_number,
            owner_id=from_account.owner_id,
            account_type=from_account.account_type,
            balance=from_account.balance,
        ),
        to_account=AccountResponse(
            account_number=to_account.account_number,
            owner_id=to_account.owner_id,
            account_type=to_account.account_type,
            balance=to_account.balance,
        ),
    )
