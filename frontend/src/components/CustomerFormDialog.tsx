import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { branchesApi } from "../api/branches";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Branch, Customer } from "../types";

interface Props {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onCreate: (values: { username: string; password: string; full_name: string; branch_code: string }) => Promise<void>;
  onUpdate: (id: string, values: { full_name: string; branch_code: string }) => Promise<void>;
}

export default function CustomerFormDialog({ open, customer, onClose, onCreate, onUpdate }: Props) {
  const notify = useNotify();
  const isEdit = customer !== null;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(customer?.username ?? "");
      setPassword("");
      setFullName(customer?.full_name ?? "");
      setBranchCode(customer?.branch_code ?? "");
      (async () => {
        try {
          const data = await branchesApi.list();
          setBranches(data);
          if (!customer && data.length > 0) setBranchCode(data[0].branch_code);
        } catch (err) {
          notify(err instanceof ApiError ? err.message : "Failed to load branches", "error");
        }
      })();
    }
  }, [open, customer, notify]);

  const canSubmit = isEdit
    ? fullName.trim() !== "" && branchCode !== ""
    : username.trim() !== "" && password.trim() !== "" && fullName.trim() !== "" && branchCode !== "";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEdit && customer) {
        await onUpdate(customer.id, { full_name: fullName, branch_code: branchCode });
      } else {
        await onCreate({ username, password, full_name: fullName, branch_code: branchCode });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? "Edit Customer" : "New Customer"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!isEdit && (
            <>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            </>
          )}
          <TextField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Branch"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            fullWidth
            disabled={branches.length === 0}
          >
            {branches.map((b) => (
              <MenuItem key={b.branch_code} value={b.branch_code}>
                {b.name} ({b.branch_code})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
