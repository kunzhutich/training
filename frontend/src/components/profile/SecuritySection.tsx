import { useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { customersApi } from "../../api/customers";
import { authApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuth } from "../../AuthContext";
import { useNotify } from "../../NotificationContext";

export default function SecuritySection() {
  const { user, updateProfile } = useAuth();
  const notify = useNotify();

  const [newUsername, setNewUsername] = useState(user?.username ?? "");
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleUsernameSave = async () => {
    if (!user) return;
    setUsernameSubmitting(true);
    try {
      await customersApi.updateUsername(user.id, newUsername.trim());
      updateProfile({ username: newUsername.trim() });
      notify("Username updated.");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update username", "error");
    } finally {
      setUsernameSubmitting(false);
    }
  };

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmitPassword =
    currentPassword.trim() !== "" && newPassword.length >= 6 && newPassword === confirmPassword;

  const handlePasswordSave = async () => {
    if (!user) return;
    setPasswordSubmitting(true);
    try {
      await authApi.changePassword({
        username: user.username,
        current_password: currentPassword,
        new_password: newPassword,
      });
      notify("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to change password", "error");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Username
      </Typography>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          size="small"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleUsernameSave}
          disabled={newUsername.trim().length < 3 || newUsername.trim() === user.username || usernameSubmitting}
          sx={{ whiteSpace: "nowrap" }}
        >
          Save
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Password
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="At least 6 characters"
          size="small"
          fullWidth
        />
        <TextField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={mismatch}
          helperText={mismatch ? "Passwords do not match" : " "}
          size="small"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handlePasswordSave}
          disabled={!canSubmitPassword || passwordSubmitting}
          sx={{ alignSelf: "flex-start" }}
        >
          Change Password
        </Button>
      </Stack>
    </Paper>
  );
}
