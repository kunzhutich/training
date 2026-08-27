from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import AccountType


class AccountCreateRequest(BaseModel):
    customer_id: str
    account_type: AccountType
    opening_balance: Decimal = Field(default=Decimal("0.00"), ge=0)


class AccountResponse(BaseModel):
    account_number: str
    owner_id: str
    account_type: AccountType
    balance: Decimal


class AmountRequest(BaseModel):
    amount: Decimal = Field(gt=0)


class CloseAccountResponse(BaseModel):
    account_number: str
    payout: Decimal
