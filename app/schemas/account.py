from datetime import datetime
from decimal import Decimal
from typing import Optional

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
    opened_at: datetime
    rule_description: str
    min_balance: Optional[Decimal] = None
    overdraft_limit: Optional[Decimal] = None
    alert_threshold: Optional[Decimal] = None


class AmountRequest(BaseModel):
    amount: Decimal = Field(gt=0)


class SetMinBalanceRequest(BaseModel):
    value: Decimal = Field(ge=0)


class SetOverdraftLimitRequest(BaseModel):
    value: Decimal = Field(ge=0)


class SetAlertThresholdRequest(BaseModel):
    value: Optional[Decimal] = Field(default=None, ge=0)


class CloseAccountResponse(BaseModel):
    account_number: str
    payout: Decimal
