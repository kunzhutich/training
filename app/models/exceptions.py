class BankError(Exception):
    """Base class for every error raised by this application."""


class InvalidAmountError(BankError):
    """Raised when a monetary amount is missing, zero, or negative."""


class InsufficientFundsError(BankError):
    """Raised when a withdrawal/transfer would break an account's rules
    (overdraft limit for checking, minimum balance for savings)."""


class AccountNotFoundError(BankError):
    """Raised when an account number does not exist at this bank."""


class CustomerNotFoundError(BankError):
    """Raised when a customer id does not exist at this bank."""


class DuplicateUsernameError(BankError):
    """Raised when a username is already registered."""


class AuthenticationError(BankError):
    """Raised when login credentials, or a bearer token, are invalid."""


class AuthorizationError(BankError):
    """Raised when an authenticated principal lacks access to a resource."""


class BranchNotFoundError(BankError):
    """Raised when a branch code does not exist at this bank."""


class DuplicateBranchCodeError(BankError):
    """Raised when a branch code is already registered."""


class AccountNotEmptyError(BankError):
    """Raised when closing an account that has a negative (overdrawn) balance."""
