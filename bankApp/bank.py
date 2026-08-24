from decimal import Decimal
from typing import Dict, List

from account import Account, CheckingAccount, SavingsAccount
from branch import Branch
from enums import AccountType, TransactionType
from exceptions import AccountNotFoundError, AuthenticationError
from user import Customer, User


class Bank:
    def __init__(self, name: str):
        self._name = name
        self._users: Dict[str, User] = {}
        self._accounts: Dict[str, Account] = {}
        self._branches: Dict[str, Branch] = {}

    @property
    def name(self) -> str:
        return self._name

    def register_branch(self, branch: Branch) -> None:
        self._branches[branch.branch_code] = branch

    def register_user(self, user: User) -> None:
        self._users[user.username] = user

    def open_account(
        self,
        customer: Customer,
        account_type: AccountType,
        opening_balance: Decimal = Decimal("0.00")
    ) -> Account:
        match account_type:
            case AccountType.SAVINGS:
                account: Account = SavingsAccount(customer.user_id, opening_balance)
            case AccountType.CHECKING:
                account = CheckingAccount(customer.user_id, opening_balance)
            case _:
                raise ValueError(f"Unsupported account type: {account_type}")

        self._accounts[account.account_number] = account
        customer.link_account(account.account_number)
        return account

    def authenticate(self, username: str, password: str) -> User:
        user = self._users.get(username)
        if user is None or not user.check_password(password):
            raise AuthenticationError("Invalid username or password.")
        return user

    def get_account(self, account_number: str) -> Account:
        account = self._accounts.get(account_number)
        if account is None:
            raise AccountNotFoundError(f"No account with number {account_number}.")
        return account

    def accounts_for_customer(self, customer: Customer) -> List[Account]:
        return [self._accounts[num] for num in customer.account_numbers]

    def all_customers(self) -> List[Customer]:
        return [u for u in self._users.values() if isinstance(u, Customer)]

    def all_accounts(self) -> List[Account]:
        return list(self._accounts.values())

    def all_branches(self) -> List[Branch]:
        return list(self._branches.values())


    def transfer(self, from_account: Account, to_account: Account, amount: Decimal) -> None:
        from_account.withdraw(amount)
        from_account.relabel_last_as_transfer(TransactionType.TRANSFER_OUT, to_account.account_number)
        to_account.deposit(amount)
        to_account.relabel_last_as_transfer(TransactionType.TRANSFER_IN, from_account.account_number)


    def accounts_by_branch(self, branch_code: str) -> List[Account]:
        accounts: List[Account] = []
        for customer in self.all_customers():
            if customer.branch_code == branch_code:
                accounts.extend(self.accounts_for_customer(customer))
        return accounts

    def monthly_transaction_volume(self, branch_code: str, year: int, month: int) -> Decimal:
        total = Decimal("0.00")
        for account in self.accounts_by_branch(branch_code):
            for txn in account.transactions:
                if txn.timestamp.year == year and txn.timestamp.month == month:
                    total += txn.amount
        return total

    def branches_over_staff_ratio(self, limit: float) -> List[Branch]:
        return [b for b in self._branches.values() if b.staff_to_manager_ratio() > limit]


    def seed_data(self) -> None:
        from user import Admin

        main_branch = Branch("NY", "New York Fed Res", manager_id="M001")
        for staff_id in ("S001", "S002", "S003"):
            main_branch.add_staff(staff_id)
        self.register_branch(main_branch)
 
        self.register_user(Admin("U000", "admin", "admin123", "Bank Administrator"))
 
        alice = Customer("U001", "alice", "alice123", "Alice Nguyen", "NY")
        bob = Customer("U002", "bob", "bob123", "Bob Martins", "NY")
        self.register_user(alice)
        self.register_user(bob)
 
        self.open_account(alice, AccountType.SAVINGS, Decimal("500.00"))
        self.open_account(alice, AccountType.CHECKING, Decimal("200.00"))
        self.open_account(bob, AccountType.SAVINGS, Decimal("1000.00"))
