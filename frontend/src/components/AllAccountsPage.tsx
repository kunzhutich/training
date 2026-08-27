import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import HistoryIcon from "@mui/icons-material/History";
import { accountsApi } from "../api/accounts";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Account } from "../types";
import TransactionHistoryDialog from "./TransactionHistoryDialog";

export default function AllAccountsPage() {
  const notify = useNotify();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [historyAccount, setHistoryAccount] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAccounts(await accountsApi.listAll());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (a) => a.account_number.toLowerCase().includes(term) || a.owner_id.toLowerCase().includes(term),
    );
  }, [accounts, search]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        All Accounts
      </Typography>

      <TextField
        placeholder="Search by account number or owner id"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        size="small"
        sx={{ mb: 2, width: 360 }}
      />

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Owner ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No accounts found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((acc) => (
                  <TableRow key={acc.account_number} hover>
                    <TableCell>{acc.account_number}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{acc.owner_id}</TableCell>
                    <TableCell>
                      <Chip size="small" label={acc.account_type} />
                    </TableCell>
                    <TableCell align="right">${Number(acc.balance).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Transaction history">
                        <IconButton size="small" onClick={() => setHistoryAccount(acc.account_number)}>
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <TransactionHistoryDialog
        open={historyAccount !== null}
        accountNumber={historyAccount}
        onClose={() => setHistoryAccount(null)}
      />
    </Box>
  );
}
