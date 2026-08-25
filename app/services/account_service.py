from decimal import Decimal

from app.models.account import Account, CheckingAccount, SavingsAccount
from app.models.enums import AccountType
from app.repositories.account_repository import AccountRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.customer_service import CustomerService


class AccountService:
    def __init__(self, account_repo: AccountRepository, customer_repo: CustomerRepository) -> None:
        self._account_repo = account_repo
        self._customer_service = CustomerService(customer_repo)

    def open_account(self, customer_id: str, account_type: AccountType, opening_balance: Decimal) -> Account:
        customer = self._customer_service.get_customer(customer_id)

        account: Account
        if account_type == AccountType.SAVINGS:
            account = SavingsAccount(customer.id, opening_balance)
        else:
            account = CheckingAccount(customer.id, opening_balance)

        self._account_repo.add(account)
        customer.link_account(account.account_number)
        return account
