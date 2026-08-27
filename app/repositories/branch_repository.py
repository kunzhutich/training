from typing import List, Optional

from pymongo.collection import Collection
from pymongo.database import Database

from app.models.branch import Branch

_SEED_BRANCH_CODE = "NY"
_SEED_BRANCH_NAME = "New York Fed Res"


class BranchRepository:
    def __init__(self, database: Database) -> None:
        self._collection: Collection = database["branches"]
        self._collection.update_one(
            {"_id": _SEED_BRANCH_CODE},
            {"$setOnInsert": {"name": _SEED_BRANCH_NAME}},
            upsert=True,
        )

    def add(self, branch: Branch) -> None:
        self._collection.insert_one({"_id": branch.branch_code, "name": branch.name})

    def get(self, branch_code: str) -> Optional[Branch]:
        doc = self._collection.find_one({"_id": branch_code})
        return Branch(branch_code=doc["_id"], name=doc["name"]) if doc else None

    def list_all(self) -> List[Branch]:
        return [Branch(branch_code=doc["_id"], name=doc["name"]) for doc in self._collection.find()]
