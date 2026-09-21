from app.models.account import Account, SavingsAccount
from app.schemas.account import AccountResponse


def account_to_response(account: Account) -> AccountResponse:
    return AccountResponse(
        account_number=account.account_number,
        owner_id=account.owner_id,
        account_type=account.account_type,
        balance=account.balance,
        opened_at=account.opened_at,
        rule_description=account.rule_description,
        min_balance=account.min_balance if isinstance(account, SavingsAccount) else None,
        overdraft_limit=account.overdraft_limit if not isinstance(account, SavingsAccount) else None,
        alert_threshold=account.alert_threshold,
    )
