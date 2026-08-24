from enum import Enum
 
 
class Role(Enum):
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"
 
 
class AccountType(Enum):
    SAVINGS = "SAVINGS"
    CHECKING = "CHECKING"
 
 
class TransactionType(Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
