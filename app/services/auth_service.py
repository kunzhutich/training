from app.models.admin import Admin
from app.models.customer import Customer
from app.models.enums import Role
from app.models.exceptions import AuthenticationError
from app.models.security import hash_password, verify_password
from app.repositories.admin_repository import AdminRepository
from app.repositories.customer_repository import CustomerRepository


class AuthService:
    def __init__(self, admin_repo: AdminRepository, customer_repo: CustomerRepository) -> None:
        self._admin_repo = admin_repo
        self._customer_repo = customer_repo

    def login(self, username: str, password: str) -> tuple[Admin | Customer, Role]:
        admin = self._admin_repo.get_by_username(username)
        if admin is not None and verify_password(password, admin.password_hash):
            return admin, Role.ADMIN

        customer = self._customer_repo.get_by_username(username)
        if (
            customer is not None
            and customer.is_active
            and verify_password(password, customer.password_hash)
        ):
            return customer, Role.CUSTOMER

        raise AuthenticationError("Invalid username or password.")

    def change_password(self, username: str, current_password: str, new_password: str) -> None:
        admin = self._admin_repo.get_by_username(username)
        if admin is not None:
            if not verify_password(current_password, admin.password_hash):
                raise AuthenticationError("Current password is incorrect.")
            self._admin_repo.update_password(admin.id, hash_password(new_password))
            return

        customer = self._customer_repo.get_by_username(username)
        if customer is not None:
            if not verify_password(current_password, customer.password_hash):
                raise AuthenticationError("Current password is incorrect.")
            customer.password_hash = hash_password(new_password)
            self._customer_repo.update(customer)
            return

        raise AuthenticationError("Invalid username or password.")
