from typing import Dict, List, Optional

from app.models.customer import Customer


class CustomerRepository:
    def __init__(self) -> None:
        self._customers: Dict[str, Customer] = {}

    def add(self, customer: Customer) -> None:
        self._customers[customer.id] = customer

    def get(self, customer_id: str) -> Optional[Customer]:
        return self._customers.get(customer_id)

    def get_by_username(self, username: str) -> Optional[Customer]:
        for customer in self._customers.values():
            if customer.username == username:
                return customer
        return None

    def list_all(self) -> List[Customer]:
        return list(self._customers.values())
