from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.account import AccountResponse


class TransferRequest(BaseModel):
    from_account_number: str
    to_account_number: str
    amount: Decimal = Field(gt=0)


class TransferResponse(BaseModel):
    from_account: AccountResponse
    to_account: AccountResponse
