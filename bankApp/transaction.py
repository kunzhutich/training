from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional
 
from enums import TransactionType
 
 
@dataclass
class Transaction: 
    transaction_id: str
    account_number: str
    transaction_type: TransactionType
    amount: Decimal
    balance_after: Decimal
    timestamp: datetime = field(default_factory=datetime.now)
    related_account: Optional[str] = None
 
    def __str__(self) -> str:
        related = f" (<-> {self.related_account})" if self.related_account else ""
        return (
            f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] "
            f"{self.transaction_type.value:<13} "
            f"${self.amount:>10.2f}{related}  "
            f"Balance after: ${self.balance_after:.2f}"
        )
 
