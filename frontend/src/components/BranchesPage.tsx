import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import { branchesApi } from "../api/branches";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { Branch } from "../types";

export default function BranchesPage() {
  const notify = useNotify();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchCode, setBranchCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBranches(await branchesApi.list());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await branchesApi.create({ branch_code: branchCode.trim(), name: name.trim() });
      notify("Branch created.");
      setBranchCode("");
      setName("");
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to create branch", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Branches
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {loading ? (
          <Stack sx={{ py: 3, alignItems: "center" }}>
            <CircularProgress size={24} />
          </Stack>
        ) : branches.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            No branches yet.
          </Typography>
        ) : (
          <List disablePadding>
            {branches.map((b) => (
              <ListItem key={b.branch_code} divider>
                <ListItemText primary={b.name} secondary={b.branch_code} />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Add Branch
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Branch Code"
            placeholder="LA"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            sx={{ minWidth: 140 }}
          />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={!branchCode.trim() || !name.trim() || submitting}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
