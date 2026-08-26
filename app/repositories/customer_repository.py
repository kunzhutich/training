from dataclasses import asdict
from typing import List, Optional

from pymongo.collection import Collection
from pymongo.database import Database

from app.models.customer import Customer


class CustomerRepository:
    def __init__(self, database: Database) -> None:
        self._collection: Collection = database["customers"]

    def add(self, customer: Customer) -> None:
        self._collection.insert_one(self._to_document(customer))

    def update(self, customer: Customer) -> None:
        self._collection.replace_one({"_id": customer.id}, self._to_document(customer), upsert=True)

    def get(self, customer_id: str) -> Optional[Customer]:
        doc = self._collection.find_one({"_id": customer_id})
        return self._to_customer(doc) if doc else None

    def get_by_username(self, username: str) -> Optional[Customer]:
        doc = self._collection.find_one({"username": username})
        return self._to_customer(doc) if doc else None

    def list_all(self) -> List[Customer]:
        return [self._to_customer(doc) for doc in self._collection.find()]

    @staticmethod
    def _to_document(customer: Customer) -> dict:
        doc = asdict(customer)
        doc["_id"] = doc.pop("id")
        return doc

    @staticmethod
    def _to_customer(doc: dict) -> Customer:
        data = dict(doc)
        data["id"] = data.pop("_id")
        return Customer(**data)
