import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNotify } from "../NotificationContext";
import type { Account } from "../types";
import TransactionHistoryPanel from "./TransactionHistoryPanel";

interface Props {
  initialAccountNumber?: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

export default function StatementsPage({ initialAccountNumber }: Props) {
  const { user } = useAuth();
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(initialAccountNumber ?? "");
  const [year, setYear] = useState(CURRENT_YEAR);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await accountsApi.forCustomer(user.id);
      setAccounts(data);
      setSelectedAccount((current) => {
        if (current && data.some((a) => a.account_number === current)) return current;
        if (initialAccountNumber && data.some((a) => a.account_number === initialAccountNumber)) {
          return initialAccountNumber;
        }
        return data[0]?.account_number ?? "";
      });
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [user, notify, initialAccountNumber]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const { yearStart, yearEnd } = useMemo(
    () => ({ yearStart: `${year}-01-01`, yearEnd: `${year}-12-31` }),
    [year],
  );

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Statements
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {loading ? (
          <Stack sx={{ py: 4, alignItems: "center" }}>
            <CircularProgress size={24} />
          </Stack>
        ) : accounts.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            You have no accounts yet.
          </Typography>
        ) : (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                select
                label="Account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                size="small"
                sx={{ minWidth: 260 }}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc.account_number} value={acc.account_number}>
                    {acc.account_number} ({acc.account_type})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 140 }}
              >
                {YEAR_OPTIONS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TransactionHistoryPanel
              accountNumber={selectedAccount || null}
              initialStartDate={yearStart}
              initialEndDate={yearEnd}
              scrollable={false}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
