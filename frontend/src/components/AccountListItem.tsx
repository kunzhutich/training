import { useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Account } from "../types";
import AmountDialog from "./AmountDialog";
import ConfirmDialog from "./ConfirmDialog";
import TransactionHistoryDialog from "./TransactionHistoryDialog";

interface Props {
  account: Account;
  onChanged: () => void;
}

export default function AccountListItem({ account, onChanged }: Props) {
  const notify = useNotify();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const handleDeposit = async (amount: string) => {
    try {
      await accountsApi.deposit(account.account_number, amount);
      notify(`Deposited $${Number(amount).toFixed(2)} into ${account.account_number}.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Deposit failed", "error");
    }
  };

  const handleWithdraw = async (amount: string) => {
    try {
      await accountsApi.withdraw(account.account_number, amount);
      notify(`Withdrew $${Number(amount).toFixed(2)} from ${account.account_number}.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Withdrawal failed", "error");
    }
  };

  const handleClose = async () => {
    setCloseConfirmOpen(false);
    try {
      const result = await accountsApi.close(account.account_number);
      notify(`Closed ${result.account_number}. $${Number(result.payout).toFixed(2)} paid out.`);
      onChanged();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to close account", "error");
    }
  };

  return (
    <>
      <ListItem divider>
        <AccountBalanceWalletIcon sx={{ mr: 2, color: "primary.main" }} />
        <ListItemText
          primary={account.account_number}
          secondary={<Chip size="small" label={account.account_type} sx={{ mt: 0.5 }} />}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
          ${Number(account.balance).toFixed(2)}
        </Typography>
        <Stack direction="row">
          <Tooltip title="Deposit">
            <IconButton size="small" onClick={() => setDepositOpen(true)}>
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Withdraw">
            <IconButton size="small" onClick={() => setWithdrawOpen(true)}>
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transaction history">
            <IconButton size="small" onClick={() => setHistoryOpen(true)}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close account">
            <IconButton size="small" onClick={() => setCloseConfirmOpen(true)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </ListItem>

      <AmountDialog
        open={depositOpen}
        title={`Deposit into ${account.account_number}`}
        confirmLabel="Deposit"
        onClose={() => setDepositOpen(false)}
        onSubmit={handleDeposit}
      />
      <AmountDialog
        open={withdrawOpen}
        title={`Withdraw from ${account.account_number}`}
        confirmLabel="Withdraw"
        onClose={() => setWithdrawOpen(false)}
        onSubmit={handleWithdraw}
      />
      <TransactionHistoryDialog
        open={historyOpen}
        accountNumber={account.account_number}
        onClose={() => setHistoryOpen(false)}
      />
      <ConfirmDialog
        open={closeConfirmOpen}
        title="Close account"
        message={`Close ${account.account_number}? Any remaining balance ($${Number(account.balance).toFixed(2)}) will be paid out, and this cannot be undone.`}
        confirmLabel="Close Account"
        destructive
        onConfirm={handleClose}
        onCancel={() => setCloseConfirmOpen(false)}
      />
    </>
  );
}
