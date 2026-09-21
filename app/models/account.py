from abc import ABC, abstractmethod
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from app.models.enums import AccountType, TransactionType
from app.models.exceptions import AccountNotEmptyError, InsufficientFundsError, InvalidAmountError
from app.models.transaction import Transaction


class Account(ABC):
    def __init__(self, account_number: str, owner_id: str, opening_balance: Decimal = Decimal("0.00")):
        self._account_number = account_number
        self._owner_id = owner_id
        self._balance = Decimal("0.00")
        self._transactions: List[Transaction] = []
        self._opened_at = datetime.now()
        self._alert_threshold: Optional[Decimal] = None
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
    def opened_at(self) -> datetime:
        return self._opened_at

    @property
    def alert_threshold(self) -> Optional[Decimal]:
        return self._alert_threshold

    def set_alert_threshold(self, value: Optional[Decimal]) -> None:
        if value is not None and value < 0:
            raise InvalidAmountError("Alert threshold cannot be negative.")
        self._alert_threshold = value

    @property
    @abstractmethod
    def account_type(self) -> AccountType: ...

    @property
    @abstractmethod
    def rule_description(self) -> str:
        """Human-readable description of the type-specific rule governing this account."""
        ...

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

    def close_out(self) -> Decimal:
        """Empty the account for closure and return the payout amount.

        This deliberately bypasses subclass withdrawal rules (minimum
        balance, overdraft limit) - those exist to keep an account usable
        for continued banking, not to block the terminal act of closing it.
        A negative balance (money owed to the bank) still blocks closure.
        """
        if self._balance < 0:
            raise AccountNotEmptyError(
                f"Cannot close {self._account_number}: outstanding overdraft balance of "
                f"${-self._balance:.2f} must be repaid first."
            )
        payout = self._balance
        if payout > 0:
            self._balance = Decimal("0.00")
            self._record(TransactionType.WITHDRAWAL, payout)
        return payout


class SavingsAccount(Account):
    MIN_BALANCE = Decimal("100.00")

    def __init__(self, account_number: str, owner_id: str, opening_balance: Decimal = Decimal("0.00")):
        self._custom_min_balance: Optional[Decimal] = None
        super().__init__(account_number, owner_id, opening_balance)

    @property
    def min_balance(self) -> Decimal:
        return self._custom_min_balance if self._custom_min_balance is not None else SavingsAccount.MIN_BALANCE

    def set_min_balance(self, value: Decimal) -> None:
        # Customers may only tighten their own floor above the bank's actual
        # minimum (personal savings discipline) - never loosen past it.
        if value < SavingsAccount.MIN_BALANCE:
            raise InvalidAmountError(
                f"Minimum balance cannot be set below the bank minimum of ${SavingsAccount.MIN_BALANCE:.2f}."
            )
        self._custom_min_balance = value

    def withdraw(self, amount: Decimal) -> None:
        self._validate_amount(amount)
        remaining = self._balance - amount
        if remaining < self.min_balance:
            raise InsufficientFundsError(
                f"Savings withdrawal denied: balance cannot go below ${self.min_balance:.2f}."
            )
        self._balance = remaining
        self._record(TransactionType.WITHDRAWAL, amount)

    @property
    def account_type(self) -> AccountType:
        return AccountType.SAVINGS

    @property
    def rule_description(self) -> str:
        return f"Minimum balance: ${self.min_balance:.2f}"


class CheckingAccount(Account):
    OVERDRAFT_LIMIT = Decimal("500.00")

    def __init__(self, account_number: str, owner_id: str, opening_balance: Decimal = Decimal("0.00")):
        self._custom_overdraft_limit: Optional[Decimal] = None
        super().__init__(account_number, owner_id, opening_balance)

    @property
    def overdraft_limit(self) -> Decimal:
        return (
            self._custom_overdraft_limit
            if self._custom_overdraft_limit is not None
            else CheckingAccount.OVERDRAFT_LIMIT
        )

    def set_overdraft_limit(self, value: Decimal) -> None:
        # Customers may only tighten their own limit below the bank's actual
        # maximum (personal spending control) - never loosen past it.
        if value < 0 or value > CheckingAccount.OVERDRAFT_LIMIT:
            raise InvalidAmountError(
                f"Overdraft limit must be between $0.00 and ${CheckingAccount.OVERDRAFT_LIMIT:.2f}."
            )
        self._custom_overdraft_limit = value

    def withdraw(self, amount: Decimal) -> None:
        self._validate_amount(amount)
        remaining = self._balance - amount
        if remaining < -self.overdraft_limit:
            raise InsufficientFundsError(
                f"Checking withdrawal denied: overdraft limit of ${self.overdraft_limit:.2f} exceeded."
            )
        self._balance = remaining
        self._record(TransactionType.WITHDRAWAL, amount)

    @property
    def account_type(self) -> AccountType:
        return AccountType.CHECKING

    @property
    def rule_description(self) -> str:
        return f"Overdraft limit: ${self.overdraft_limit:.2f}"
