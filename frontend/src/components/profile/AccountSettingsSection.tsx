import { useCallback, useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { accountsApi } from "../../api/accounts";
import { ApiError } from "../../api/client";
import { useAuth } from "../../AuthContext";
import { useNotify } from "../../NotificationContext";
import type { Account, AccountType } from "../../types";

function useCustomerAccounts() {
  const { user } = useAuth();
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setAccounts(await accountsApi.forCustomer(user.id));
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { accounts, loading, reload };
}

function OpenAccountBlock({ onOpened }: { onOpened: () => void }) {
  const { user } = useAuth();
  const notify = useNotify();
  const [accountType, setAccountType] = useState<AccountType>("SAVINGS");
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAccount = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const account = await accountsApi.open({
        customer_id: user.id,
        account_type: accountType,
        opening_balance: openingBalance,
      });
      notify(`Opened ${account.account_type.toLowerCase()} account ${account.account_number}.`);
      setOpeningBalance("0.00");
      onOpened();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to open account", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Open a New Account
      </Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="Account Type"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as AccountType)}
          fullWidth
        >
          <MenuItem value="SAVINGS">Savings</MenuItem>
          <MenuItem value="CHECKING">Checking</MenuItem>
        </TextField>
        <TextField
          label="Opening Balance"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleOpenAccount}
          disabled={submitting}
          sx={{ alignSelf: "flex-start" }}
        >
          Open Account
        </Button>
      </Stack>
    </Paper>
  );
}

function MinBalanceBlock({ accounts, onChanged }: { accounts: Account[]; onChanged: () => void }) {
  const notify = useNotify();
  const savings = accounts.filter((a) => a.account_type === "SAVINGS");
  const [selected, setSelected] = useState(savings[0]?.account_number ?? "");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selected && savings.length > 0) setSelected(savings[0].account_number);
    const acc = savings.find((a) => a.account_number === selected);
    if (acc) setValue(acc.min_balance ?? "100.00");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, selected]);

  if (savings.length === 0) return null;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await accountsApi.setMinBalance(selected, value);
      notify(`Minimum balance for ${selected} updated.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update minimum balance", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Savings Minimum Balance
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Set a personal floor at or above the bank minimum ($100.00) for extra savings discipline.
      </Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="Account"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          size="small"
          fullWidth
        >
          {savings.map((a) => (
            <MenuItem key={a.account_number} value={a.account_number}>
              {a.account_number} (current: ${Number(a.min_balance ?? 100).toFixed(2)})
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Minimum Balance" value={value} onChange={(e) => setValue(e.target.value)} size="small" fullWidth />
        <Button variant="contained" onClick={handleSave} disabled={submitting} sx={{ alignSelf: "flex-start" }}>
          Save
        </Button>
      </Stack>
    </Paper>
  );
}

function OverdraftLimitBlock({ accounts, onChanged }: { accounts: Account[]; onChanged: () => void }) {
  const notify = useNotify();
  const checking = accounts.filter((a) => a.account_type === "CHECKING");
  const [selected, setSelected] = useState(checking[0]?.account_number ?? "");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selected && checking.length > 0) setSelected(checking[0].account_number);
    const acc = checking.find((a) => a.account_number === selected);
    if (acc) setValue(acc.overdraft_limit ?? "500.00");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, selected]);

  if (checking.length === 0) return null;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await accountsApi.setOverdraftLimit(selected, value);
      notify(`Overdraft limit for ${selected} updated.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update overdraft limit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Checking Overdraft Limit
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Lower your own limit below the bank maximum ($500.00) for extra spending control.
      </Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="Account"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          size="small"
          fullWidth
        >
          {checking.map((a) => (
            <MenuItem key={a.account_number} value={a.account_number}>
              {a.account_number} (current: ${Number(a.overdraft_limit ?? 500).toFixed(2)})
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Overdraft Limit" value={value} onChange={(e) => setValue(e.target.value)} size="small" fullWidth />
        <Button variant="contained" onClick={handleSave} disabled={submitting} sx={{ alignSelf: "flex-start" }}>
          Save
        </Button>
      </Stack>
    </Paper>
  );
}

function BalanceAlertBlock({ accounts, onChanged }: { accounts: Account[]; onChanged: () => void }) {
  const notify = useNotify();
  const [selected, setSelected] = useState(accounts[0]?.account_number ?? "");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selected && accounts.length > 0) setSelected(accounts[0].account_number);
    const acc = accounts.find((a) => a.account_number === selected);
    setValue(acc?.alert_threshold ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, selected]);

  if (accounts.length === 0) return null;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await accountsApi.setAlertThreshold(selected, value.trim() === "" ? null : value);
      notify(value.trim() === "" ? `Alert cleared for ${selected}.` : `Low-balance alert set for ${selected}.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update alert", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Low-Balance Alerts
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Shows an in-app warning on this account when its balance drops to or below the amount you set. Leave blank
        to turn off. (In-app only — no email or text is sent.)
      </Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="Account"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          size="small"
          fullWidth
        >
          {accounts.map((a) => (
            <MenuItem key={a.account_number} value={a.account_number}>
              {a.account_number} ({a.account_type})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Alert Threshold"
          placeholder="e.g. 50.00 (blank = off)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handleSave} disabled={submitting} sx={{ alignSelf: "flex-start" }}>
          Save
        </Button>
      </Stack>
    </Paper>
  );
}

export default function AccountSettingsSection() {
  const { accounts, loading, reload } = useCustomerAccounts();

  if (loading) {
    return (
      <Stack sx={{ py: 4, alignItems: "center" }}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <OpenAccountBlock onOpened={reload} />
      <MinBalanceBlock accounts={accounts} onChanged={reload} />
      <OverdraftLimitBlock accounts={accounts} onChanged={reload} />
      <BalanceAlertBlock accounts={accounts} onChanged={reload} />
    </Stack>
  );
}
