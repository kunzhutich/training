import { useEffect, useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Account, AccountType, Customer } from "../types";
import AccountListItem from "./AccountListItem";

interface Props {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

export default function CustomerAccountsDialog({ open, customer, onClose }: Props) {
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("SAVINGS");
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [opening, setOpening] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const data = await accountsApi.forCustomer(customer.id);
      setAccounts(data);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [customer, notify]);

  useEffect(() => {
    if (open) {
      setAccountType("SAVINGS");
      setOpeningBalance("0.00");
      void loadAccounts();
    }
  }, [open, loadAccounts]);

  const handleOpenAccount = async () => {
    if (!customer) return;
    setOpening(true);
    try {
      await accountsApi.open({
        customer_id: customer.id,
        account_type: accountType,
        opening_balance: openingBalance,
      });
      notify("Account opened.");
      await loadAccounts();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to open account", "error");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{customer ? `${customer.full_name}'s Accounts` : "Accounts"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack sx={{ py: 4, alignItems: "center" }}>
            <CircularProgress size={28} />
          </Stack>
        ) : accounts.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No accounts yet.
          </Typography>
        ) : (
          <List disablePadding>
            {accounts.map((acc) => (
              <AccountListItem
                key={acc.account_number}
                account={acc}
                onChanged={loadAccounts}
                accountHolderName={customer?.full_name}
                branchCode={customer?.branch_code}
              />
            ))}
          </List>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
