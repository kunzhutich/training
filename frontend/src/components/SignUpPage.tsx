import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { customersApi } from "../api/customers";
import { branchesApi } from "../api/branches";
import { ApiError } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNotify } from "../NotificationContext";
import type { Branch } from "../types";

interface Props {
  onSwitchToLogin: () => void;
}

export default function SignUpPage({ onSwitchToLogin }: Props) {
  const { login } = useAuth();
  const notify = useNotify();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await branchesApi.list();
        setBranches(data);
        if (data.length > 0) setBranchCode(data[0].branch_code);
      } catch (err) {
        notify(err instanceof ApiError ? err.message : "Failed to load branches", "error");
      }
    })();
  }, [notify]);

  const canSubmit =
    username.trim().length >= 3 && password.length >= 6 && fullName.trim() !== "" && branchCode !== "";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await customersApi.create({
        username: username.trim(),
        password,
        full_name: fullName.trim(),
        branch_code: branchCode,
      });
      await login({ username: username.trim(), password });
      notify(`Welcome, ${fullName.trim()}!`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Sign up failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        py: 4,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 380 }}>
        <Stack spacing={1} sx={{ mb: 3, alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            <AccountBalanceIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join Federal Reserve Bank
          </Typography>
        </Stack>

        <Stack
          spacing={2}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <TextField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText="At least 3 characters"
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 6 characters"
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
          <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
            Sign Up
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Already have an account?{" "}
          <Link component="button" type="button" onClick={onSwitchToLogin}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
