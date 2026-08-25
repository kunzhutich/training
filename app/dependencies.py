from fastapi import Depends

from app.repositories.account_repository import AccountRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.account_service import AccountService
from app.services.customer_service import CustomerService
from app.services.transaction_service import TransactionService

_customer_repo = CustomerRepository()
_account_repo = AccountRepository()


def get_customer_repository() -> CustomerRepository:
    return _customer_repo


def get_account_repository() -> AccountRepository:
    return _account_repo


def get_customer_service(
    customer_repo: CustomerRepository = Depends(get_customer_repository),
) -> CustomerService:
    return CustomerService(customer_repo)


def get_account_service(
    account_repo: AccountRepository = Depends(get_account_repository),
    customer_repo: CustomerRepository = Depends(get_customer_repository),
) -> AccountService:
    return AccountService(account_repo, customer_repo)


def get_transaction_service(
    account_repo: AccountRepository = Depends(get_account_repository),
) -> TransactionService:
    return TransactionService(account_repo)
