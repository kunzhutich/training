from abc import ABC, abstractmethod
from decimal import Decimal
from typing import List, Optional

from app.models.enums import AccountType, TransactionType
from app.models.exceptions import InsufficientFundsError, InvalidAmountError
from app.models.transaction import Transaction


class Account(ABC):
    def __init__(self, account_number: str, owner_id: str, opening_balance: Decimal = Decimal("0.00")):
        self._account_number = account_number
        self._owner_id = owner_id
        self._balance = Decimal("0.00")
        self._transactions: List[Transaction] = []
        if opening_balance > 0:
            self.deposit(opening_balance)

    @property
    def account_number(self) -> str:
        return self._account_number

    @property
    def owner_id(self) -> str:
        return self._owner_id

    @property
    def balance(self) -> Decimal:
        return self._balance

    @property
    def transactions(self) -> List[Transaction]:
        return list(self._transactions)

    @property
    @abstractmethod
    def account_type(self) -> AccountType: ...

    @abstractmethod
    def withdraw(self, amount: Decimal) -> None: ...

    def deposit(self, amount: Decimal) -> None:
        self._validate_amount(amount)
        self._balance += amount
        self._record(TransactionType.DEPOSIT, amount)

    @staticmethod
    def _validate_amount(amount: Decimal) -> None:
        if amount is None or amount <= 0:
            raise InvalidAmountError("Amount must be a positive number.")

    def _record(self, ttype: TransactionType, amount: Decimal, related: Optional[str] = None) -> None:
        txn = Transaction(
            transaction_id=f"TXN{len(self._transactions) + 1:04d}-{self._account_number}",
            account_number=self._account_number,
            transaction_type=ttype,
            amount=amount,
            balance_after=self._balance,
            related_account=related,
        )
        self._transactions.append(txn)

    def relabel_last_as_transfer(self, transaction_type: TransactionType, counterpart_account: str) -> None:
        if self._transactions:
            last = self._transactions[-1]
            last.transaction_type = transaction_type
            last.related_account = counterpart_account


class SavingsAccount(Account):
    MIN_BALANCE = Decimal("100.00")

    def withdraw(self, amount: Decimal) -> None:
        self._validate_amount(amount)
        remaining = self._balance - amount
        if remaining < SavingsAccount.MIN_BALANCE:
            raise InsufficientFundsError(
                f"Savings withdrawal denied: balance cannot go below ${SavingsAccount.MIN_BALANCE:.2f}."
            )
        self._balance = remaining
        self._record(TransactionType.WITHDRAWAL, amount)

    @property
    def account_type(self) -> AccountType:
        return AccountType.SAVINGS


class CheckingAccount(Account):
    OVERDRAFT_LIMIT = Decimal("500.00")

    def withdraw(self, amount: Decimal) -> None:
        self._validate_amount(amount)
        remaining = self._balance - amount
        if remaining < -CheckingAccount.OVERDRAFT_LIMIT:
            raise InsufficientFundsError(
                f"Checking withdrawal denied: overdraft limit of ${CheckingAccount.OVERDRAFT_LIMIT:.2f} exceeded."
            )
        self._balance = remaining
        self._record(TransactionType.WITHDRAWAL, amount)

    @property
    def account_type(self) -> AccountType:
        return AccountType.CHECKING
