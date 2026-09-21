from typing import List
from uuid import uuid4

from app.models.customer import Customer
from app.models.exceptions import BranchNotFoundError, CustomerNotFoundError, DuplicateUsernameError
from app.models.security import hash_password
from app.repositories.branch_repository import BranchRepository
from app.repositories.customer_repository import CustomerRepository


class CustomerService:
    def __init__(self, customer_repo: CustomerRepository, branch_repo: BranchRepository) -> None:
        self._customer_repo = customer_repo
        self._branch_repo = branch_repo

    def _require_branch(self, branch_code: str) -> None:
        if self._branch_repo.get(branch_code) is None:
            raise BranchNotFoundError(f"No branch with code {branch_code}.")

    def create_customer(
        self,
        username: str,
        password: str,
        full_name: str,
        branch_code: str,
        email: str = "",
        phone: str = "",
        address: str = "",
    ) -> Customer:
        self._require_branch(branch_code)
        if self._customer_repo.get_by_username(username) is not None:
            raise DuplicateUsernameError(f"Username '{username}' is already taken.")

        customer = Customer(
            id=str(uuid4()),
            username=username,
            password_hash=hash_password(password),
            full_name=full_name,
            branch_code=branch_code,
            email=email,
            phone=phone,
            address=address,
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

    def update_customer(
        self,
        customer_id: str,
        full_name: str | None,
        branch_code: str | None,
        email: str | None = None,
        phone: str | None = None,
        address: str | None = None,
    ) -> Customer:
        customer = self.get_customer(customer_id)
        if full_name is not None:
            customer.full_name = full_name
        if branch_code is not None:
            self._require_branch(branch_code)
            customer.branch_code = branch_code
        if email is not None:
            customer.email = email
        if phone is not None:
            customer.phone = phone
        if address is not None:
            customer.address = address
        self._customer_repo.update(customer)
        return customer

    def update_username(self, customer_id: str, new_username: str) -> Customer:
        customer = self.get_customer(customer_id)
        existing = self._customer_repo.get_by_username(new_username)
        if existing is not None and existing.id != customer_id:
            raise DuplicateUsernameError(f"Username '{new_username}' is already taken.")
        customer.username = new_username
        self._customer_repo.update(customer)
        return customer

    def deactivate_customer(self, customer_id: str) -> Customer:
        customer = self.get_customer(customer_id)
        customer.is_active = False
        self._customer_repo.update(customer)
        return customer

    def reactivate_customer(self, customer_id: str) -> Customer:
        customer = self.get_customer(customer_id)
        customer.is_active = True
        self._customer_repo.update(customer)
        return customer

    def save(self, customer: Customer) -> None:
        self._customer_repo.update(customer)
