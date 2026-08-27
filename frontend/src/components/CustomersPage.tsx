import { useEffect, useState, useCallback, useMemo } from "react";
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
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { customersApi } from "../api/customers";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Customer } from "../types";
import CustomerFormDialog from "./CustomerFormDialog";
import CustomerAccountsDialog from "./CustomerAccountsDialog";
import ConfirmDialog from "./ConfirmDialog";

export default function CustomersPage() {
  const notify = useNotify();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [accountsCustomer, setAccountsCustomer] = useState<Customer | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customersApi.list();
      setCustomers(data);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.username.toLowerCase().includes(term) ||
        c.full_name.toLowerCase().includes(term) ||
        c.branch_code.toLowerCase().includes(term),
    );
  }, [customers, search]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const handleCreate = async (values: { username: string; password: string; full_name: string; branch_code: string }) => {
    try {
      await customersApi.create(values);
      notify("Customer created.");
      await loadCustomers();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to create customer", "error");
    }
  };

  const handleUpdate = async (id: string, values: { full_name: string; branch_code: string }) => {
    try {
      await customersApi.update(id, values);
      notify("Customer updated.");
      await loadCustomers();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update customer", "error");
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    const customer = deactivateTarget;
    setDeactivateTarget(null);
    try {
      await customersApi.deactivate(customer.id);
      notify(`${customer.full_name} deactivated.`);
      await loadCustomers();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to deactivate customer", "error");
    }
  };

  const handleReactivate = async (customer: Customer) => {
    try {
      await customersApi.reactivate(customer.id);
      notify(`${customer.full_name} reactivated.`);
      await loadCustomers();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to reactivate customer", "error");
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCustomer(null);
            setFormOpen(true);
          }}
        >
          New Customer
        </Button>
      </Stack>

      <TextField
        placeholder="Search by username, name, or branch"
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
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Accounts</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No customers found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell>{customer.full_name}</TableCell>
                    <TableCell>{customer.branch_code}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.is_active ? "Active" : "Inactive"}
                        color={customer.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.account_numbers.length}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View accounts">
                        <IconButton onClick={() => setAccountsCustomer(customer)}>
                          <AccountBalanceWalletIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            setEditingCustomer(customer);
                            setFormOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {customer.is_active ? (
                        <Tooltip title="Deactivate">
                          <IconButton onClick={() => setDeactivateTarget(customer)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Reactivate">
                          <IconButton onClick={() => handleReactivate(customer)}>
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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

      <CustomerFormDialog
        open={formOpen}
        customer={editingCustomer}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <CustomerAccountsDialog
        open={accountsCustomer !== null}
        customer={accountsCustomer}
        onClose={() => setAccountsCustomer(null)}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        title="Deactivate customer"
        message={`Deactivate ${deactivateTarget?.full_name ?? ""}? They will no longer be able to log in until reactivated.`}
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </Box>
  );
}
