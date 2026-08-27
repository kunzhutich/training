import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import { accountsApi } from "../api/accounts";
import { transactionsApi } from "../api/transactions";
import { ApiError } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNotify } from "../NotificationContext";
import type { Account, AccountType } from "../types";
import AccountListItem from "./AccountListItem";
import EditProfileDialog from "./EditProfileDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function CustomerHome() {
  const { user } = useAuth();
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountType, setAccountType] = useState<AccountType>("SAVINGS");
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [opening, setOpening] = useState(false);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transferring, setTransferring] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await accountsApi.forCustomer(user.id);
      setAccounts(data);
      setFromAccount((current) =>
        data.some((a) => a.account_number === current) ? current : (data[0]?.account_number ?? ""),
      );
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleOpenAccount = async () => {
    if (!user) return;
    setOpening(true);
    try {
      await accountsApi.open({ customer_id: user.id, account_type: accountType, opening_balance: openingBalance });
      notify("Account opened.");
      await loadAccounts();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to open account", "error");
    } finally {
      setOpening(false);
    }
  };

  const handleTransfer = async () => {
    setTransferring(true);
    try {
      await transactionsApi.transfer({
        from_account_number: fromAccount,
        to_account_number: toAccount.trim(),
        amount: amount.trim(),
      });
      notify(`Transferred $${Number(amount).toFixed(2)}.`);
      setAmount("");
      setToAccount("");
      await loadAccounts();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Transfer failed", "error");
    } finally {
      setTransferring(false);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Welcome, {user.full_name}
          </Typography>
          {user.branch_code && <Chip size="small" label={`Branch: ${user.branch_code}`} sx={{ mt: 1 }} />}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditProfileOpen(true)}>
            Edit Profile
          </Button>
          <Button size="small" startIcon={<LockResetIcon />} onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ mb: 3 }} />

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          My Accounts
        </Typography>

        {loading ? (
          <Stack sx={{ py: 3, alignItems: "center" }}>
            <CircularProgress size={24} />
          </Stack>
        ) : accounts.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            You have no accounts yet.
          </Typography>
        ) : (
          <List disablePadding>
            {accounts.map((acc) => (
              <AccountListItem key={acc.account_number} account={acc} onChanged={loadAccounts} />
            ))}
          </List>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Open New Account
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            sx={{ minWidth: 140 }}
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
          <Button variant="contained" onClick={handleOpenAccount} disabled={opening} sx={{ whiteSpace: "nowrap" }}>
            Open
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Transfer Funds
        </Typography>
        <Stack spacing={2}>
          <TextField
            select
            label="From Account"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            disabled={accounts.length === 0}
            fullWidth
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.account_number} value={acc.account_number}>
                {acc.account_number} (${Number(acc.balance).toFixed(2)})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="To Account Number"
            placeholder="ACC1002"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<SwapHorizIcon />}
            disabled={!fromAccount || !toAccount.trim() || !amount.trim() || transferring}
            onClick={handleTransfer}
          >
            Transfer
          </Button>
        </Stack>
      </Paper>

      <EditProfileDialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <ChangePasswordDialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </Box>
  );
}
