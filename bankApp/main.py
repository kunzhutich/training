from decimal import Decimal, InvalidOperation
from typing import Optional

from account import Account
from bank import Bank
from exceptions import AuthenticationError, BankError
from user import Admin, Customer, User


def print_message(message: str) -> None:
    print(f"\n{'=' * 60}\n{message}\n{'=' * 60}")


def read_amount(prompt: str) -> Decimal:
    while True:
        raw = input(prompt).strip()

        try:
            amount = Decimal(raw)
        except InvalidOperation:
            print("That doesn't look like a number. Try again.")
            continue

        if amount <= 0:
            print("Amount must be greater than zero. Try again.")
            continue

        return amount


def login(bank: Bank) -> Optional[User]:
    print_message(f"Welcome to {bank.name}. Please log in.")
    max_attempts = 3

    for attempt in range(max_attempts, 0, -1):
        username = input("Username: ").strip()
        password = input("Password: ").strip()

        try:
            return bank.authenticate(username, password)
        except AuthenticationError as e:
            remaining = attempt - 1
            note = f"{remaining} attempt(s) left." if remaining else "No attempts left. Please contact support."
            print(f"{e} {note}")

    return None


def admin_dashboard(bank: Bank, admin: Admin) -> None:
    print_message(f"Admin Dashboard - {admin.full_name}")
    menu = (
        "1. View all customers\n"
        "2. View all accounts\n"
        "3. View branch report\n"
        "4. Log out"
    )
    
    while True:
        print(f"\n{menu}")
        choice = input("Select an option: ").strip()
        match choice:
            case "1": 
                customers = bank.all_customers()
                print(f"\n{len(customers)} customer(s):")
                for c in customers:
                    print(f" - {c}")
            case "2":
                accounts = bank.all_accounts()
                print(f"\n{len(accounts)} account(s):")
                for acc in accounts:
                    print(f" - {acc}")
            case "3":
                for branch in bank.all_branches():
                    accounts = bank.accounts_by_branch(branch.branch_code)
                    ratio_flag = "HIGH" if branch.staff_to_manager_ratio() > 2 else "OK"
                    print(f"\n{branch}")
                    print(f" Accounts at branch : {len(accounts)}")
                    print(f" Staff/manager ratio: {branch.staff_to_manager_ratio():.1f}({ratio_flag})")
            case "4":
                print("Logging out of admin dashboard.")
                return
            case _:
                print("Invalid option, please chooose 1-4.")


def pick_account(bank: Bank, customer: Customer) -> Optional[Account]:
    accounts = bank.accounts_for_customer(customer)
    if not accounts:
        print("You have no accounts yet.")
        return None

    print("\nYour accounts:")
    for i, acc in enumerate(accounts, start=1):
        print(f" {i}. {acc}")
    choice = input("Choose an account number (or 0 to cancel): ").strip()

    if not choice.isdigit() or not (0 < int(choice) <= len(accounts)):
        return None

    return accounts[int(choice) - 1]


def customer_dashboard(bank: Bank, customer: Customer) -> None:
    print_message(f"Customer Dashboard - {customer.full_name}")
    menu = (
        "1. View my accounts\n"
        "2. Deposit\n"
        "3. Withdraw\n"
        "4. Transfer\n"
        "5. Log out\n"
    )

    while True:
        print(f"\n{menu}")
        choice = input("Select an option: ").strip()
        match choice:
            case "1":
                accounts = bank.accounts_for_customer(customer)
                label = "account" if len(accounts) == 1 else "accounts"
                print(f"\nYou have {len(accounts)} {label}:")
                for acc in accounts:
                    print(f" - {acc}")
            case "2":
                account = pick_account(bank, customer)
                if account is not None:
                    amount = read_amount("Deposit amount: $")
                    account.deposit(amount)
                    print(f"Deposited ${amount:.2f}. New balance: ${account.balance:.2f}")
            case "3":
                account = pick_account(bank, customer)
                if account is not None:
                    amount = read_amount("Withdrawal amount: $")
                    try:
                        account.withdraw(amount)
                        print(f"Withdrew ${amount:.2f}. New balance: ${account.balance:.2f}")
                    except BankError as e:
                        print(f"Withdrawal failed: {e}")
            case "4":
                print("Select the source account:")
                source = pick_account(bank, customer)
                if source is None:
                    continue

                target_number = input("Destination account number: ").strip()
                try:
                    target = bank.get_account(target_number)
                    amount = read_amount("Transfer amount: $")
                    bank.transfer(source, target, amount)
                    print(f"Transferred ${amount:.2f} to {target.account_number}.")
                except BankError as e:
                    print(f"Transfer failed: {e}")
            case "5":
                print("Logging out of cusomter dashboard.")
                return
            case _:
                print("Invalid option, please choose 1-5.")


def main() -> None:
    bank = Bank("Federal Reserve")
    bank.seed_data()

    user = login(bank)
    if user is None:
        print_message("Login failed. Please log in to proceed.")
        return

    print_message(f"Login successful. Welcome, {user.full_name}!")

    if isinstance(user, Admin):
        admin_dashboard(bank, user)
    elif isinstance(user, Customer):
        customer_dashboard(bank, user)

    print_message(f"Thank you for banking with {bank.name}. Goodbye, {user.full_name}!")


if __name__ == "__main__":
    main()