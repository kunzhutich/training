import { useEffect, useMemo, useState, useCallback } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Transaction, TransactionType } from "../types";

interface Props {
  accountNumber: string | null;
  /** Bump this to force a reload (e.g. after a deposit/withdrawal elsewhere). */
  refreshKey?: number;
  /** Applied to the From/To fields whenever they change (e.g. a year picker above this panel). */
  initialStartDate?: string;
  initialEndDate?: string;
  /** When true (default), the table scrolls within a fixed-height box. Set false to let it grow with the page. */
  scrollable?: boolean;
}

const TYPE_OPTIONS: (TransactionType | "ALL")[] = ["ALL", "DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"];

function toCsv(rows: Transaction[]): string {
  const header = "transaction_id,type,amount,balance_after,timestamp,related_account";
  const lines = rows.map((t) =>
    [t.transaction_id, t.transaction_type, t.amount, t.balance_after, t.timestamp, t.related_account ?? ""].join(","),
  );
  return [header, ...lines].join("\n");
}

export default function TransactionHistoryPanel({
  accountNumber,
  refreshKey,
  initialStartDate,
  initialEndDate,
  scrollable = true,
}: Props) {
  const notify = useNotify();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [endDate, setEndDate] = useState(initialEndDate ?? "");

  useEffect(() => {
    if (initialStartDate !== undefined) setStartDate(initialStartDate);
  }, [initialStartDate]);

  useEffect(() => {
    if (initialEndDate !== undefined) setEndDate(initialEndDate);
  }, [initialEndDate]);

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

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "ALL" && t.transaction_type !== typeFilter) return false;
      const day = t.timestamp.slice(0, 10);
      if (startDate && day < startDate) return false;
      if (endDate && day > endDate) return false;
      return true;
    });
  }, [transactions, typeFilter, startDate, endDate]);

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${accountNumber ?? "account"}-transactions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!accountNumber) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No account selected.
      </Typography>
    );
  }

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | "ALL")}
          sx={{ minWidth: 160 }}
          size="small"
        >
          {TYPE_OPTIONS.map((t) => (
            <MenuItem key={t} value={t}>
              {t === "ALL" ? "All types" : t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={filtered.length === 0}
          sx={{ whiteSpace: "nowrap" }}
        >
          Export CSV
        </Button>
      </Stack>

      {loading ? (
        <Stack sx={{ py: 4, alignItems: "center" }}>
          <CircularProgress size={24} />
        </Stack>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No transactions match these filters.
        </Typography>
      ) : (
        <TableContainer sx={scrollable ? { maxHeight: 420 } : undefined}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell>Related Account</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.transaction_id} hover>
                  <TableCell>{new Date(t.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={t.transaction_type} />
                  </TableCell>
                  <TableCell align="right">${Number(t.amount).toFixed(2)}</TableCell>
                  <TableCell align="right">${Number(t.balance_after).toFixed(2)}</TableCell>
                  <TableCell>{t.related_account ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
