from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import TransactionType
from app.schemas.account import AccountResponse


class TransferRequest(BaseModel):
    from_account_number: str
    to_account_number: str
    amount: Decimal = Field(gt=0)


class TransferResponse(BaseModel):
    from_account: AccountResponse
    to_account: AccountResponse


class TransactionResponse(BaseModel):
    transaction_id: str
    account_number: str
    transaction_type: TransactionType
    amount: Decimal
    balance_after: Decimal
    timestamp: datetime
    related_account: Optional[str] = None
