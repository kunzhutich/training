import { useEffect, useState, useCallback, useMemo } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Transaction } from "../types";

interface Props {
  accountNumber: string | null;
  limit?: number;
  refreshKey?: number;
  onSeeMore: () => void;
}

export default function RecentTransactionsList({ accountNumber, limit = 10, refreshKey, onSeeMore }: Props) {
  const notify = useNotify();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accountNumber) return;
    setLoading(true);
    try {
      const data = await accountsApi.transactions(accountNumber);
      setTransactions(data);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [accountNumber, notify]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const recent = useMemo(() => transactions.slice(-limit).reverse(), [transactions, limit]);

  if (!accountNumber) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No account selected.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Stack sx={{ py: 4, alignItems: "center" }}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (recent.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No transactions yet.
      </Typography>
    );
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Balance After</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recent.map((t) => (
            <TableRow key={t.transaction_id} hover>
              <TableCell>{new Date(t.timestamp).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip size="small" label={t.transaction_type} />
              </TableCell>
              <TableCell align="right">${Number(t.amount).toFixed(2)}</TableCell>
              <TableCell align="right">${Number(t.balance_after).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" sx={{ justifyContent: "center", pt: 2 }}>
        <Button size="small" onClick={onSeeMore}>
          See More
        </Button>
      </Stack>
    </>
  );
}
