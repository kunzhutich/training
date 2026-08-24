class BankError(Exception):
    """Base class for every error raised by this application."""
 
 
class InvalidAmountError(BankError):
    """Raised when a monetary amount is missing, zero, or negative."""
 
 
class InsufficientFundsError(BankError):
    """Raised when a withdrawal/transfer would break an account's rules
    (overdraft limit for checking, minimum balance for savings)."""
 
 
class AccountNotFoundError(BankError):
    """Raised when an account number does not exist at this bank."""
 
 
class AuthenticationError(BankError):
    """Raised when login credentials are invalid."""
