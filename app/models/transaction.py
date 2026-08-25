from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional

from app.models.enums import TransactionType


@dataclass
class Transaction:
    transaction_id: str
    account_number: str
    transaction_type: TransactionType
    amount: Decimal
    balance_after: Decimal
    timestamp: datetime = field(default_factory=datetime.now)
    related_account: Optional[str] = None
