from typing import Dict, List, Optional

from app.models.account import Account


class AccountRepository:
    def __init__(self) -> None:
        self._accounts: Dict[str, Account] = {}

    def add(self, account: Account) -> None:
        self._accounts[account.account_number] = account

    def get(self, account_number: str) -> Optional[Account]:
        return self._accounts.get(account_number)

    def list_all(self) -> List[Account]:
        return list(self._accounts.values())
