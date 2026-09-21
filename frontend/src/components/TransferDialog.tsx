import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { transactionsApi } from "../api/transactions";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Account } from "../types";

interface Props {
  open: boolean;
  accounts: Account[];
  onClose: () => void;
  onTransferred: () => void;
}

export default function TransferDialog({ open, accounts, onClose, onTransferred }: Props) {
  const notify = useNotify();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFromAccount(accounts[0]?.account_number ?? "");
      setToAccount("");
      setAmount("");
    }
  }, [open, accounts]);

  const canSubmit = fromAccount !== "" && toAccount.trim() !== "" && amount.trim() !== "";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await transactionsApi.transfer({
        from_account_number: fromAccount,
        to_account_number: toAccount.trim(),
        amount: amount.trim(),
      });
      notify(`Transferred $${Number(amount).toFixed(2)}.`);
      onTransferred();
      onClose();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Transfer failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Transfer Funds</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
