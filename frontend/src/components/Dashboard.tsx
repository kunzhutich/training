import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import { customersApi } from "../api/customers";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Account, Customer } from "../types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const notify = useNotify();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [customerData, accountData] = await Promise.all([customersApi.list(), accountsApi.listAll()]);
        setCustomers(customerData);
        setAccounts(accountData);
      } catch (err) {
        notify(err instanceof ApiError ? err.message : "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [notify]);

  const stats = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.is_active).length;
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const byBranch = new Map<string, number>();
    for (const c of customers) {
      byBranch.set(c.branch_code, (byBranch.get(c.branch_code) ?? 0) + 1);
    }
    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalAccounts: accounts.length,
      totalBalance,
      byBranch: Array.from(byBranch.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [customers, accounts]);

  if (loading) {
    return (
      <Stack sx={{ py: 6, alignItems: "center" }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Customers" value={String(stats.totalCustomers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active Customers" value={String(stats.activeCustomers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Accounts" value={String(stats.totalAccounts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Balance" value={`$${stats.totalBalance.toFixed(2)}`} />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 420 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Customers by Branch
        </Typography>
        {stats.byBranch.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            No data yet.
          </Typography>
        ) : (
          <List disablePadding>
            {stats.byBranch.map(([branch, count]) => (
              <ListItem key={branch} divider disableGutters>
                <ListItemText primary={branch} />
                <Chip size="small" label={count} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
