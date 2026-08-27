import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useAuth } from "../AuthContext";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";

interface Props {
  onSwitchToSignUp: () => void;
}

export default function LoginPage({ onSwitchToSignUp }: Props) {
  const { login } = useAuth();
  const notify = useNotify();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.trim() !== "" && password.trim() !== "";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Login failed", "error");
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
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 360 }}>
        <Stack spacing={1} sx={{ mb: 3, alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            <AccountBalanceIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Federal Reserve Bank
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
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
          <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
            Sign In
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          New here?{" "}
          <Link component="button" type="button" onClick={onSwitchToSignUp}>
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
