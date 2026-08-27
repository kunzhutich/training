from fastapi import APIRouter, Depends, status

from app.auth import Principal, get_current_principal, require_admin, require_self_or_admin
from app.dependencies import get_account_service, get_customer_service
from app.schemas.account import AccountResponse
from app.schemas.customer import CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest
from app.services.account_service import AccountService
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreateRequest,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    # Intentionally open (no auth guard) - this also serves as the public
    # self-registration endpoint, not just admin-driven customer creation.
    customer = service.create_customer(
        username=payload.username,
        password=payload.password,
        full_name=payload.full_name,
        branch_code=payload.branch_code,
    )
    return CustomerResponse(**customer.__dict__)


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    service: CustomerService = Depends(get_customer_service),
    _: Principal = Depends(require_admin),
) -> list[CustomerResponse]:
    return [CustomerResponse(**c.__dict__) for c in service.list_customers()]


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: str,
    service: CustomerService = Depends(get_customer_service),
    principal: Principal = Depends(get_current_principal),
) -> CustomerResponse:
    require_self_or_admin(principal, customer_id)
    customer = service.get_customer(customer_id)
    return CustomerResponse(**customer.__dict__)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    payload: CustomerUpdateRequest,
    service: CustomerService = Depends(get_customer_service),
    principal: Principal = Depends(get_current_principal),
) -> CustomerResponse:
    require_self_or_admin(principal, customer_id)
    customer = service.update_customer(customer_id, payload.full_name, payload.branch_code)
    return CustomerResponse(**customer.__dict__)


@router.delete("/{customer_id}", response_model=CustomerResponse)
def deactivate_customer(
    customer_id: str,
    service: CustomerService = Depends(get_customer_service),
    principal: Principal = Depends(get_current_principal),
) -> CustomerResponse:
    require_self_or_admin(principal, customer_id)
    customer = service.deactivate_customer(customer_id)
    return CustomerResponse(**customer.__dict__)


@router.post("/{customer_id}/reactivate", response_model=CustomerResponse)
def reactivate_customer(
    customer_id: str,
    service: CustomerService = Depends(get_customer_service),
    _: Principal = Depends(require_admin),
) -> CustomerResponse:
    # Admin-only: a deactivated customer can no longer log in to reactivate themselves.
    customer = service.reactivate_customer(customer_id)
    return CustomerResponse(**customer.__dict__)


@router.get("/{customer_id}/accounts", response_model=list[AccountResponse])
def list_customer_accounts(
    customer_id: str,
    service: AccountService = Depends(get_account_service),
    principal: Principal = Depends(get_current_principal),
) -> list[AccountResponse]:
    require_self_or_admin(principal, customer_id)
    accounts = service.list_accounts_for_customer(customer_id)
    return [
        AccountResponse(
            account_number=a.account_number,
            owner_id=a.owner_id,
            account_type=a.account_type,
            balance=a.balance,
        )
        for a in accounts
    ]
