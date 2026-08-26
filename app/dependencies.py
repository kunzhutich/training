from fastapi import Depends
from pymongo.database import Database

from app.database import get_database
from app.repositories.account_repository import AccountRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.account_service import AccountService
from app.services.customer_service import CustomerService
from app.services.transaction_service import TransactionService


def get_customer_repository(database: Database = Depends(get_database)) -> CustomerRepository:
    return CustomerRepository(database)


def get_account_repository(database: Database = Depends(get_database)) -> AccountRepository:
    return AccountRepository(database)


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
