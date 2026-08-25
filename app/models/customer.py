from dataclasses import dataclass, field
from typing import List


@dataclass
class Customer:
    id: str
    username: str
    password_hash: str
    full_name: str
    branch_code: str
    is_active: bool = True
    account_numbers: List[str] = field(default_factory=list)

    def link_account(self, account_number: str) -> None:
        self.account_numbers.append(account_number)
