from fastapi import APIRouter, Depends, status

from app.auth import Principal, get_current_principal, require_admin, require_self_or_admin
from app.dependencies import get_account_service
from app.mappers import account_to_response as _to_response
from app.schemas.account import (
    AccountCreateRequest,
    AccountResponse,
    AmountRequest,
    CloseAccountResponse,
    SetAlertThresholdRequest,
    SetMinBalanceRequest,
    SetOverdraftLimitRequest,
)
from app.schemas.transaction import TransactionResponse
from app.services.account_service import AccountService

router = APIRouter(prefix="/api/v1/accounts", tags=["accounts"])


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def open_account(
    payload: AccountCreateRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    require_self_or_admin(principal, payload.customer_id)
    account = service.open_account(payload.customer_id, payload.account_type, payload.opening_balance)
    return _to_response(account)


@router.get("", response_model=list[AccountResponse])
def list_all_accounts(
    service: AccountService = Depends(get_account_service),
    _: Principal = Depends(require_admin),
) -> list[AccountResponse]:
    return [_to_response(a) for a in service.list_all_accounts()]


@router.get("/{account_number}", response_model=AccountResponse)
def get_account(
    account_number: str,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    return _to_response(account)


@router.post("/{account_number}/deposit", response_model=AccountResponse)
def deposit(
    account_number: str,
    payload: AmountRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    account = service.deposit(account_number, payload.amount)
    return _to_response(account)


@router.post("/{account_number}/withdraw", response_model=AccountResponse)
def withdraw(
    account_number: str,
    payload: AmountRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    account = service.withdraw(account_number, payload.amount)
    return _to_response(account)


@router.put("/{account_number}/min-balance", response_model=AccountResponse)
def set_min_balance(
    account_number: str,
    payload: SetMinBalanceRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    account = service.set_min_balance(account_number, payload.value)
    return _to_response(account)


@router.put("/{account_number}/overdraft-limit", response_model=AccountResponse)
def set_overdraft_limit(
    account_number: str,
    payload: SetOverdraftLimitRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    account = service.set_overdraft_limit(account_number, payload.value)
    return _to_response(account)


@router.put("/{account_number}/alert-threshold", response_model=AccountResponse)
def set_alert_threshold(
    account_number: str,
    payload: SetAlertThresholdRequest,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> AccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    account = service.set_alert_threshold(account_number, payload.value)
    return _to_response(account)


@router.get("/{account_number}/transactions", response_model=list[TransactionResponse])
def list_transactions(
    account_number: str,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> list[TransactionResponse]:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    return [
        TransactionResponse(
            transaction_id=t.transaction_id,
            account_number=t.account_number,
            transaction_type=t.transaction_type,
            amount=t.amount,
            balance_after=t.balance_after,
            timestamp=t.timestamp,
            related_account=t.related_account,
        )
        for t in service.get_transactions(account_number)
    ]


@router.delete("/{account_number}", response_model=CloseAccountResponse)
def close_account(
    account_number: str,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> CloseAccountResponse:
    account = service.get_account(account_number)
    require_self_or_admin(principal, account.owner_id)
    payout = service.close_account(account_number)
    return CloseAccountResponse(account_number=account_number, payout=payout)
