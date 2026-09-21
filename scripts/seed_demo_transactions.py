"""One-off/reusable script: replaces each existing account's transaction
history with a realistic, backdated multi-month simulation (paychecks, rent,
groceries, a monthly auto-save transfer, etc.) so the app has something
meaningful to show in Recent Activity / Statements.

Events are generated and sorted chronologically before being applied - the
API (and this script) always appends transactions in call order, so the
insertion order must already match the backdated timestamp order or the
displayed history would jump around instead of reading top-to-bottom.

Run from the project root: python scripts/seed_demo_transactions.py
Requires the same .env (MONGODB_URI etc.) as the app itself.
"""

import random
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_database  # noqa: E402
from app.models.account import CheckingAccount, SavingsAccount  # noqa: E402
from app.models.enums import TransactionType  # noqa: E402
from app.repositories.account_repository import AccountRepository  # noqa: E402

random.seed(42)

TODAY = datetime.now()
HISTORY_DAYS = 165  # ~5.5 months back


@dataclass
class Event:
    when: datetime
    kind: str  # "deposit" | "withdraw"
    amount: Decimal
    transfer_to: Optional[str] = None  # counterpart account_number if this is a transfer


def rand_amount(low: float, high: float) -> Decimal:
    return Decimal(str(round(random.uniform(low, high), 2)))


def month_starts(start: datetime, end: datetime):
    cursor = start.replace(day=1)
    while cursor <= end:
        yield cursor
        year = cursor.year + (1 if cursor.month == 12 else 0)
        month = 1 if cursor.month == 12 else cursor.month + 1
        cursor = cursor.replace(year=year, month=month)


def checking_events(has_savings_partner: bool) -> list[Event]:
    events: list[Event] = []
    start = TODAY - timedelta(days=HISTORY_DAYS)
    for month_start in month_starts(start, TODAY):
        y, m = month_start.year, month_start.month

        def day(d: int) -> datetime:
            return datetime(y, m, min(d, 28), 9, random.randint(0, 23), random.randint(0, 59))

        month_events = [
            Event(day(1), "deposit", rand_amount(1750, 2100)),
            Event(day(15), "deposit", rand_amount(1750, 2100)),
            Event(day(3), "withdraw", rand_amount(1100, 1400)),
            Event(day(12), "withdraw", rand_amount(80, 160)),
            Event(day(5), "withdraw", Decimal("12.99")),
        ]
        for gday in (6, 13, 20, 27):
            month_events.append(Event(day(gday), "withdraw", rand_amount(35, 130)))
        for _ in range(3):
            month_events.append(Event(day(random.randint(2, 27)), "withdraw", rand_amount(15, 65)))
        if has_savings_partner:
            month_events.append(Event(day(16), "withdraw", rand_amount(250, 400), transfer_to="__savings__"))

        month_events.sort(key=lambda e: e.when)
        events.extend(month_events)
    return [e for e in events if e.when <= TODAY]


def standalone_savings_events() -> list[Event]:
    events: list[Event] = []
    start = TODAY - timedelta(days=HISTORY_DAYS)
    for month_start in month_starts(start, TODAY):
        y, m = month_start.year, month_start.month

        def day(d: int) -> datetime:
            return datetime(y, m, min(d, 28), 10, random.randint(0, 23), random.randint(0, 59))

        month_events = []
        if random.random() < 0.6:
            month_events.append(Event(day(random.randint(1, 27)), "deposit", rand_amount(150, 500)))
        if random.random() < 0.3:
            month_events.append(Event(day(random.randint(1, 27)), "withdraw", rand_amount(50, 150)))
        month_events.sort(key=lambda e: e.when)
        events.extend(month_events)
    return [e for e in events if e.when <= TODAY]


def savings_interest_events() -> list[Event]:
    events = []
    start = TODAY - timedelta(days=HISTORY_DAYS)
    for month_start in month_starts(start, TODAY):
        when = datetime(month_start.year, month_start.month, 28, 23, 0, 0)
        events.append(Event(when, "deposit", rand_amount(3, 9)))
    return [e for e in events if e.when <= TODAY]


def apply_event(account, event: Event) -> bool:
    try:
        if event.kind == "deposit":
            account.deposit(event.amount)
        else:
            account.withdraw(event.amount)
    except Exception:
        return False
    account._transactions[-1].timestamp = event.when
    return True


def main() -> None:
    db = get_database()
    repo = AccountRepository(db)

    accounts = {a.account_number: a for a in repo.list_all()}
    print(f"Found {len(accounts)} accounts: {list(accounts.keys())}")

    fresh: dict[str, object] = {}
    for number, acc in accounts.items():
        cls = CheckingAccount if isinstance(acc, CheckingAccount) else SavingsAccount
        fresh[number] = cls(number, acc.owner_id, Decimal("0.00"))

    by_owner: dict[str, list[str]] = {}
    for number, acc in accounts.items():
        by_owner.setdefault(acc.owner_id, []).append(number)

    handled: set[str] = set()
    for owner_id, numbers in by_owner.items():
        checking_num = next((n for n in numbers if isinstance(accounts[n], CheckingAccount)), None)
        savings_num = next((n for n in numbers if isinstance(accounts[n], SavingsAccount)), None)
        if not (checking_num and savings_num):
            continue

        checking_acc = fresh[checking_num]
        savings_acc = fresh[savings_num]

        # Merge checking events with this savings account's interest events,
        # sorted chronologically, so both accounts' histories stay ordered.
        merged: list[tuple[Event, str]] = [(e, "checking") for e in checking_events(True)]
        merged.extend((e, "savings") for e in savings_interest_events())
        merged.sort(key=lambda pair: pair[0].when)

        for event, source in merged:
            if source == "checking":
                if event.transfer_to == "__savings__":
                    if apply_event(checking_acc, event):
                        checking_acc.relabel_last_as_transfer(TransactionType.TRANSFER_OUT, savings_num)
                        deposit_event = Event(event.when, "deposit", event.amount)
                        if apply_event(savings_acc, deposit_event):
                            savings_acc.relabel_last_as_transfer(TransactionType.TRANSFER_IN, checking_num)
                else:
                    apply_event(checking_acc, event)
            else:
                apply_event(savings_acc, event)

        handled.add(checking_num)
        handled.add(savings_num)

    for number, acc in fresh.items():
        if number in handled:
            continue
        events = checking_events(False) if isinstance(acc, CheckingAccount) else sorted(
            standalone_savings_events() + savings_interest_events(), key=lambda e: e.when
        )
        for event in events:
            apply_event(acc, event)

    for number, acc in fresh.items():
        repo.update(acc)
        print(f"{number}: {len(acc.transactions)} transactions, balance ${acc.balance:.2f}")

    print("Done.")


if __name__ == "__main__":
    main()
