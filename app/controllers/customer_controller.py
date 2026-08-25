from fastapi import APIRouter, Depends, status

from app.dependencies import get_customer_service
from app.schemas.customer import CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreateRequest,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    customer = service.create_customer(
        username=payload.username,
        password=payload.password,
        full_name=payload.full_name,
        branch_code=payload.branch_code,
    )
    return CustomerResponse(**customer.__dict__)


@router.get("", response_model=list[CustomerResponse])
def list_customers(service: CustomerService = Depends(get_customer_service)) -> list[CustomerResponse]:
    return [CustomerResponse(**c.__dict__) for c in service.list_customers()]


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: str,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    customer = service.get_customer(customer_id)
    return CustomerResponse(**customer.__dict__)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    payload: CustomerUpdateRequest,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    customer = service.update_customer(customer_id, payload.full_name, payload.branch_code)
    return CustomerResponse(**customer.__dict__)


@router.delete("/{customer_id}", response_model=CustomerResponse)
def deactivate_customer(
    customer_id: str,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    customer = service.deactivate_customer(customer_id)
    return CustomerResponse(**customer.__dict__)
