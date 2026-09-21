import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
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

interface FlaggedAccount {
  account: Account;
  owner: Customer | undefined;
  reasons: string[];
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

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const stats = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.is_active).length;
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalAccounts: accounts.length,
      totalBalance,
    };
  }, [customers, accounts]);

  const branchPerformance = useMemo(() => {
    const byBranch = new Map<
      string,
      { customers: number; active: number; accounts: number; totalBalance: number }
    >();
    for (const c of customers) {
      const row = byBranch.get(c.branch_code) ?? { customers: 0, active: 0, accounts: 0, totalBalance: 0 };
      row.customers += 1;
      if (c.is_active) row.active += 1;
      byBranch.set(c.branch_code, row);
    }
    for (const a of accounts) {
      const owner = customerById.get(a.owner_id);
      if (!owner) continue;
      const row = byBranch.get(owner.branch_code) ?? { customers: 0, active: 0, accounts: 0, totalBalance: 0 };
      row.accounts += 1;
      row.totalBalance += Number(a.balance);
      byBranch.set(owner.branch_code, row);
    }
    return Array.from(byBranch.entries())
      .map(([branch, row]) => ({ branch, ...row }))
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }, [customers, accounts, customerById]);

  const flaggedAccounts = useMemo<FlaggedAccount[]>(() => {
    const flagged: FlaggedAccount[] = [];
    for (const a of accounts) {
      const reasons: string[] = [];
      if (Number(a.balance) < 0) reasons.push("Overdrawn");
      if (a.alert_threshold !== null && Number(a.balance) <= Number(a.alert_threshold)) {
        reasons.push("Low-balance alert");
      }
      if (reasons.length > 0) {
        flagged.push({ account: a, owner: customerById.get(a.owner_id), reasons });
      }
    }
    return flagged.sort((x, y) => Number(x.account.balance) - Number(y.account.balance));
  }, [accounts, customerById]);

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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Branch Performance
            </Typography>
            {branchPerformance.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 1 }}>
                No data yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Branch</TableCell>
                    <TableCell align="right">Customers</TableCell>
                    <TableCell align="right">Active</TableCell>
                    <TableCell align="right">Accounts</TableCell>
                    <TableCell align="right">Total Deposits</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branchPerformance.map((row) => (
                    <TableRow key={row.branch} hover>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell align="right">{row.customers}</TableCell>
                      <TableCell align="right">{row.active}</TableCell>
                      <TableCell align="right">{row.accounts}</TableCell>
                      <TableCell align="right">${row.totalBalance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Flagged Accounts
            </Typography>
            {flaggedAccounts.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 1 }}>
                Nothing flagged right now.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Account</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flaggedAccounts.map(({ account, owner, reasons }) => (
                    <TableRow key={account.account_number} hover>
                      <TableCell>{account.account_number}</TableCell>
                      <TableCell>{owner?.full_name ?? "—"}</TableCell>
                      <TableCell align="right" sx={{ color: Number(account.balance) < 0 ? "error.main" : undefined }}>
                        ${Number(account.balance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                          {reasons.map((r) => (
                            <Chip
                              key={r}
                              size="small"
                              label={r}
                              color={r === "Overdrawn" ? "error" : "warning"}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
