from decimal import Decimal
from typing import List, Optional

from pymongo import ReturnDocument
from pymongo.collection import Collection
from pymongo.database import Database

from app.models.account import Account, CheckingAccount, SavingsAccount
from app.models.enums import AccountType, TransactionType
from app.models.transaction import Transaction

_STARTING_ACCOUNT_SEQUENCE = 1000


class AccountRepository:
    def __init__(self, database: Database) -> None:
        self._collection: Collection = database["accounts"]
        self._counters: Collection = database["counters"]
        self._counters.update_one(
            {"_id": "account_number"},
            {"$setOnInsert": {"seq": _STARTING_ACCOUNT_SEQUENCE}},
            upsert=True,
        )

    def next_account_number(self) -> str:
        result = self._counters.find_one_and_update(
            {"_id": "account_number"},
            {"$inc": {"seq": 1}},
            return_document=ReturnDocument.AFTER,
        )
        return f"ACC{result['seq']}"

    def add(self, account: Account) -> None:
        self._collection.insert_one(self._to_document(account))

    def update(self, account: Account) -> None:
        self._collection.replace_one(
            {"_id": account.account_number}, self._to_document(account), upsert=True
        )

    def get(self, account_number: str) -> Optional[Account]:
        doc = self._collection.find_one({"_id": account_number})
        return self._to_account(doc) if doc else None

    def delete(self, account_number: str) -> None:
        self._collection.delete_one({"_id": account_number})

    def list_all(self) -> List[Account]:
        return [self._to_account(doc) for doc in self._collection.find()]

    @staticmethod
    def _to_document(account: Account) -> dict:
        return {
            "_id": account.account_number,
            "owner_id": account.owner_id,
            "account_type": account.account_type.value,
            "balance": str(account.balance),
            "transactions": [
                {
                    "transaction_id": t.transaction_id,
                    "account_number": t.account_number,
                    "transaction_type": t.transaction_type.value,
                    "amount": str(t.amount),
                    "balance_after": str(t.balance_after),
                    "timestamp": t.timestamp,
                    "related_account": t.related_account,
                }
                for t in account.transactions
            ],
        }

    @staticmethod
    def _to_account(doc: dict) -> Account:
        account_type = AccountType(doc["account_type"])
        account_cls = SavingsAccount if account_type == AccountType.SAVINGS else CheckingAccount

        # Bypass __init__ (which would re-run deposit/validation logic) and
        # rehydrate the stored state directly - this is a reconstruction,
        # not a "new account" business event.
        account = account_cls.__new__(account_cls)
        account._account_number = doc["_id"]
        account._owner_id = doc["owner_id"]
        account._balance = Decimal(doc["balance"])
        account._transactions = [
            Transaction(
                transaction_id=t["transaction_id"],
                account_number=t["account_number"],
                transaction_type=TransactionType(t["transaction_type"]),
                amount=Decimal(t["amount"]),
                balance_after=Decimal(t["balance_after"]),
                timestamp=t["timestamp"],
                related_account=t.get("related_account"),
            )
            for t in doc.get("transactions", [])
        ]
        return account
