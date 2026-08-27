from enum import Enum


class Role(str, Enum):
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"


class AccountType(str, Enum):
    SAVINGS = "SAVINGS"
    CHECKING = "CHECKING"


class TransactionType(str, Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
