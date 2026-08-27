from fastapi import Depends
from pymongo.database import Database

from app.database import get_database
from app.repositories.account_repository import AccountRepository
from app.repositories.admin_repository import AdminRepository
from app.repositories.branch_repository import BranchRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.account_service import AccountService
from app.services.auth_service import AuthService
from app.services.branch_service import BranchService
from app.services.customer_service import CustomerService
from app.services.transaction_service import TransactionService


def get_customer_repository(database: Database = Depends(get_database)) -> CustomerRepository:
    return CustomerRepository(database)


def get_account_repository(database: Database = Depends(get_database)) -> AccountRepository:
    return AccountRepository(database)


def get_admin_repository(database: Database = Depends(get_database)) -> AdminRepository:
    return AdminRepository(database)


def get_branch_repository(database: Database = Depends(get_database)) -> BranchRepository:
    return BranchRepository(database)


def get_customer_service(
    customer_repo: CustomerRepository = Depends(get_customer_repository),
    branch_repo: BranchRepository = Depends(get_branch_repository),
) -> CustomerService:
    return CustomerService(customer_repo, branch_repo)


def get_account_service(
    account_repo: AccountRepository = Depends(get_account_repository),
    customer_service: CustomerService = Depends(get_customer_service),
) -> AccountService:
    return AccountService(account_repo, customer_service)


def get_transaction_service(
    account_repo: AccountRepository = Depends(get_account_repository),
) -> TransactionService:
    return TransactionService(account_repo)


def get_auth_service(
    admin_repo: AdminRepository = Depends(get_admin_repository),
    customer_repo: CustomerRepository = Depends(get_customer_repository),
) -> AuthService:
    return AuthService(admin_repo, customer_repo)


def get_branch_service(
    branch_repo: BranchRepository = Depends(get_branch_repository),
) -> BranchService:
    return BranchService(branch_repo)
