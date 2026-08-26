from decimal import Decimal
from typing import Tuple

from app.models.account import Account
from app.models.enums import TransactionType
from app.models.exceptions import AccountNotFoundError
from app.repositories.account_repository import AccountRepository


class TransactionService:
    def __init__(self, account_repo: AccountRepository) -> None:
        self._account_repo = account_repo

    def _get_account(self, account_number: str) -> Account:
        account = self._account_repo.get(account_number)
        if account is None:
            raise AccountNotFoundError(f"No account with number {account_number}.")
        return account

    def transfer(self, from_account_number: str, to_account_number: str, amount: Decimal) -> Tuple[Account, Account]:
        from_account = self._get_account(from_account_number)
        to_account = self._get_account(to_account_number)

        from_account.withdraw(amount)
        from_account.relabel_last_as_transfer(TransactionType.TRANSFER_OUT, to_account.account_number)

        to_account.deposit(amount)
        to_account.relabel_last_as_transfer(TransactionType.TRANSFER_IN, from_account.account_number)

        self._account_repo.update(from_account)
        self._account_repo.update(to_account)

        return from_account, to_account
