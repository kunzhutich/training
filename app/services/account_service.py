from decimal import Decimal
from typing import List

from app.models.account import Account, CheckingAccount, SavingsAccount
from app.models.enums import AccountType
from app.models.exceptions import AccountNotFoundError, InvalidAmountError
from app.models.transaction import Transaction
from app.repositories.account_repository import AccountRepository
from app.services.customer_service import CustomerService


class AccountService:
    def __init__(self, account_repo: AccountRepository, customer_service: CustomerService) -> None:
        self._account_repo = account_repo
        self._customer_service = customer_service

    def open_account(self, customer_id: str, account_type: AccountType, opening_balance: Decimal) -> Account:
        customer = self._customer_service.get_customer(customer_id)
        account_number = self._account_repo.next_account_number()

        account: Account
        if account_type == AccountType.SAVINGS:
            account = SavingsAccount(account_number, customer.id, opening_balance)
        else:
            account = CheckingAccount(account_number, customer.id, opening_balance)

        self._account_repo.add(account)
        customer.link_account(account.account_number)
        self._customer_service.save(customer)
        return account

    def get_account(self, account_number: str) -> Account:
        account = self._account_repo.get(account_number)
        if account is None:
            raise AccountNotFoundError(f"No account with number {account_number}.")
        return account

    def list_accounts_for_customer(self, customer_id: str) -> List[Account]:
        self._customer_service.get_customer(customer_id)
        return [a for a in self._account_repo.list_all() if a.owner_id == customer_id]

    def list_all_accounts(self) -> List[Account]:
        return self._account_repo.list_all()

    def deposit(self, account_number: str, amount: Decimal) -> Account:
        account = self.get_account(account_number)
        account.deposit(amount)
        self._account_repo.update(account)
        return account

    def withdraw(self, account_number: str, amount: Decimal) -> Account:
        account = self.get_account(account_number)
        account.withdraw(amount)
        self._account_repo.update(account)
        return account

    def get_transactions(self, account_number: str) -> List[Transaction]:
        return self.get_account(account_number).transactions

    def set_min_balance(self, account_number: str, value: Decimal) -> Account:
        account = self.get_account(account_number)
        if not isinstance(account, SavingsAccount):
            raise InvalidAmountError("Minimum balance only applies to savings accounts.")
        account.set_min_balance(value)
        self._account_repo.update(account)
        return account

    def set_overdraft_limit(self, account_number: str, value: Decimal) -> Account:
        account = self.get_account(account_number)
        if not isinstance(account, CheckingAccount):
            raise InvalidAmountError("Overdraft limit only applies to checking accounts.")
        account.set_overdraft_limit(value)
        self._account_repo.update(account)
        return account

    def set_alert_threshold(self, account_number: str, value: Decimal | None) -> Account:
        account = self.get_account(account_number)
        account.set_alert_threshold(value)
        self._account_repo.update(account)
        return account

    def close_account(self, account_number: str) -> Decimal:
        account = self.get_account(account_number)
        payout = account.close_out()

        customer = self._customer_service.get_customer(account.owner_id)
        customer.unlink_account(account.account_number)
        self._customer_service.save(customer)
        self._account_repo.delete(account_number)
        return payout
