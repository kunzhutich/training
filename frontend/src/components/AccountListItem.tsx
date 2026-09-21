import { useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import { fakeRoutingNumber } from "../utils/routingNumber";
import type { Account } from "../types";
import AmountDialog from "./AmountDialog";
import ConfirmDialog from "./ConfirmDialog";
import TransactionHistoryDialog from "./TransactionHistoryDialog";

interface Props {
  account: Account;
  onChanged: () => void;
  accountHolderName?: string;
  branchCode?: string | null;
}

export default function AccountListItem({ account, onChanged, accountHolderName, branchCode }: Props) {
  const notify = useNotify();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const closeMenu = () => setMenuAnchor(null);

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
      <ListItem
        divider
        disablePadding
        secondaryAction={
          <Tooltip title="Account actions">
            <IconButton edge="end" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        <ListItemButton onClick={() => setExpanded((v) => !v)} sx={{ pr: 7 }}>
          <AccountBalanceWalletIcon sx={{ mr: 2, color: "primary.main" }} />
          <ListItemText
            primary={account.account_number}
            secondary={<Chip size="small" label={account.account_type} sx={{ mt: 0.5 }} />}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mr: 1 }}>
            ${Number(account.balance).toFixed(2)}
          </Typography>
          <ExpandMoreIcon
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              color: "text.secondary",
            }}
          />
        </ListItemButton>
      </ListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, py: 2, bgcolor: "action.hover" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Account Number
              </Typography>
              <Typography variant="body2">{account.account_number}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Routing Number
              </Typography>
              <Typography variant="body2">{fakeRoutingNumber(branchCode ?? account.account_number)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Account Type
              </Typography>
              <Typography variant="body2">
                {account.account_type === "SAVINGS" ? "Savings" : "Checking"}
              </Typography>
            </Grid>
            {accountHolderName && (
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Account Holder
                </Typography>
                <Typography variant="body2">{accountHolderName}</Typography>
              </Grid>
            )}
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Date Opened
              </Typography>
              <Typography variant="body2">{new Date(account.opened_at).toLocaleDateString()}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2">Active</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                Account Rule
              </Typography>
              <Typography variant="body2">{account.rule_description}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            setDepositOpen(true);
          }}
        >
          <ListItemIcon>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          Deposit
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            setWithdrawOpen(true);
          }}
        >
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          Withdraw
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            setHistoryOpen(true);
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          Transaction History
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            setCloseConfirmOpen(true);
          }}
        >
          <ListItemIcon>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          Close Account
        </MenuItem>
      </Menu>

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
