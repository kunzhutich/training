from abc import ABC, abstractmethod
from typing import List
 
from enums import Role


class User(ABC):
    def __init__(self, user_id: str, username: str, password: str, full_name: str):
        self._user_id = user_id
        self._username = username
        self._password = password
        self._full_name = full_name

    @property
    def user_id(self) -> str:
        return self._user_id

    @property
    def username(self) -> str:
        return self._username
    @property
    def full_name(self) -> str:
        return self._full_name
    
    @full_name.setter
    def full_name(self, value: str) -> None:
        if not value.strip():
            raise ValueError("Full name cannot be blank")
        self._full_name = value

    def check_password(self, password: str) -> bool:
        return self._password == password


    @property
    @abstractmethod
    def role(self) -> Role: ...

    def __str__(self) -> str:
        return f"{self._full_name} ({self._username}) - {self.role.value}"


class Admin(User):
    @property
    def role(self) -> Role:
        return Role.ADMIN

class Customer(User):
    def __init__(self, user_id: str, username: str, password: str, full_name: str, branch_code: str):
        super().__init__(user_id, username, password, full_name)
        self._branch_code = branch_code
        self._account_numbers: List[str] = []

    @property
    def branch_code(self) -> str:
        return self._branch_code

    @property
    def account_numbers(self) -> List[str]:
        return list(self._account_numbers)

    def link_account(self, account_number: str) -> None:
        self._account_numbers.append(account_number)

    @property
    def role(self) -> Role:
        return Role.CUSTOMER