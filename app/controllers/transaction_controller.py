from fastapi import APIRouter, Depends, status

from app.dependencies import get_transaction_service
from app.schemas.account import AccountResponse
from app.schemas.transaction import TransferRequest, TransferResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.post("/transfer", response_model=TransferResponse, status_code=status.HTTP_200_OK)
def transfer(
    payload: TransferRequest,
    service: TransactionService = Depends(get_transaction_service),
) -> TransferResponse:
    from_account, to_account = service.transfer(
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
