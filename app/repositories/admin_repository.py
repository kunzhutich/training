from typing import Optional

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database

from app.models.admin import Admin
from app.models.security import hash_password

_SEED_USERNAME = "admin"
_SEED_PASSWORD = "admin123"


class AdminRepository:
    def __init__(self, database: Database) -> None:
        self._collection: Collection = database["admins"]
        self._collection.update_one(
            {"username": _SEED_USERNAME},
            {
                "$setOnInsert": {
                    "password_hash": hash_password(_SEED_PASSWORD),
                    "full_name": "Bank Administrator",
                }
            },
            upsert=True,
        )

    def get_by_username(self, username: str) -> Optional[Admin]:
        doc = self._collection.find_one({"username": username})
        if doc is None:
            return None
        return Admin(
            id=str(doc["_id"]),
            username=doc["username"],
            password_hash=doc["password_hash"],
            full_name=doc["full_name"],
        )

    def update_password(self, admin_id: str, password_hash: str) -> None:
        self._collection.update_one({"_id": ObjectId(admin_id)}, {"$set": {"password_hash": password_hash}})
