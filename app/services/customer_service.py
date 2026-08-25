from typing import List
from uuid import uuid4

from app.models.customer import Customer
from app.models.exceptions import CustomerNotFoundError, DuplicateUsernameError
from app.models.security import hash_password
from app.repositories.customer_repository import CustomerRepository


class CustomerService:
    def __init__(self, customer_repo: CustomerRepository) -> None:
        self._customer_repo = customer_repo

    def create_customer(self, username: str, password: str, full_name: str, branch_code: str) -> Customer:
        if self._customer_repo.get_by_username(username) is not None:
            raise DuplicateUsernameError(f"Username '{username}' is already taken.")

        customer = Customer(
            id=str(uuid4()),
            username=username,
            password_hash=hash_password(password),
            full_name=full_name,
            branch_code=branch_code,
        )
        self._customer_repo.add(customer)
        return customer

    def list_customers(self) -> List[Customer]:
        return self._customer_repo.list_all()

    def get_customer(self, customer_id: str) -> Customer:
        customer = self._customer_repo.get(customer_id)
        if customer is None:
            raise CustomerNotFoundError(f"No customer with id {customer_id}.")
        return customer

    def update_customer(self, customer_id: str, full_name: str | None, branch_code: str | None) -> Customer:
        customer = self.get_customer(customer_id)
        if full_name is not None:
            customer.full_name = full_name
        if branch_code is not None:
            customer.branch_code = branch_code
        return customer

    def deactivate_customer(self, customer_id: str) -> Customer:
        customer = self.get_customer(customer_id)
        customer.is_active = False
        return customer
