import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { customersApi } from "../api/customers";
import { ApiError } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNotify } from "../NotificationContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileDialog({ open, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const notify = useNotify();
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setFullName(user?.full_name ?? "");
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await customersApi.update(user.id, { full_name: fullName.trim() });
      updateProfile({ full_name: fullName.trim() });
      notify("Profile updated.");
      onClose();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoFocus
          fullWidth
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={fullName.trim() === "" || submitting} onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
