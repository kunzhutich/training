import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNotify } from "../NotificationContext";
import type { Account } from "../types";
import AccountListItem from "./AccountListItem";
import TransferDialog from "./TransferDialog";
import RecentTransactionsList from "./RecentTransactionsList";
import OffersBlock from "./dashboard/OffersBlock";
import ExploreBlock from "./dashboard/ExploreBlock";
import CreditJourneyBlock from "./dashboard/CreditJourneyBlock";

interface Props {
  onViewStatements: (accountNumber: string) => void;
}

export default function CustomerDashboardPage({ onViewStatements }: Props) {
  const { user } = useAuth();
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyAccount, setHistoryAccount] = useState("");

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await accountsApi.forCustomer(user.id);
      setAccounts(data);
      setHistoryAccount((current) => {
        if (current && data.some((a) => a.account_number === current)) return current;
        return data.find((a) => a.account_type === "CHECKING")?.account_number ?? data[0]?.account_number ?? "";
      });
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
      setRefreshKey((k) => k + 1);
    }
  }, [user, notify]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const hasAccounts = accounts.length > 0;
  const historyAccountLabel = useMemo(
    () => accounts.find((a) => a.account_number === historyAccount)?.account_number ?? "",
    [accounts, historyAccount],
  );

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Welcome, {user.full_name}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", p: 2, pb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                My Accounts
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<SwapHorizIcon />}
                disabled={accounts.length === 0}
                onClick={() => setTransferOpen(true)}
              >
                Transfer Funds
              </Button>
            </Stack>

            {loading ? (
              <Stack sx={{ py: 3, alignItems: "center" }}>
                <CircularProgress size={24} />
              </Stack>
            ) : accounts.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, pb: 2 }}>
                You have no accounts yet.
              </Typography>
            ) : (
              <List disablePadding>
                {accounts.map((acc) => (
                  <AccountListItem
                    key={acc.account_number}
                    account={acc}
                    onChanged={loadAccounts}
                    accountHolderName={user.full_name}
                    branchCode={user.branch_code}
                  />
                ))}
              </List>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <TextField
                select
                label="Account"
                value={historyAccount}
                onChange={(e) => setHistoryAccount(e.target.value)}
                size="small"
                disabled={!hasAccounts}
                sx={{ minWidth: 180 }}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc.account_number} value={acc.account_number}>
                    {acc.account_number} ({acc.account_type})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <RecentTransactionsList
              accountNumber={historyAccountLabel || null}
              refreshKey={refreshKey}
              onSeeMore={() => onViewStatements(historyAccountLabel)}
            />
          </Paper>

          <TransferDialog
            open={transferOpen}
            accounts={accounts}
            onClose={() => setTransferOpen(false)}
            onTransferred={loadAccounts}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <OffersBlock />
            <ExploreBlock />
            <CreditJourneyBlock />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
