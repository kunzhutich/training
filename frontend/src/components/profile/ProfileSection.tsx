import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { customersApi } from "../../api/customers";
import { ApiError } from "../../api/client";
import { useAuth } from "../../AuthContext";
import { useNotify } from "../../NotificationContext";
import type { Customer } from "../../types";

export default function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const notify = useNotify();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const data = await customersApi.get(user.id);
        setCustomer(data);
        setFullName(data.full_name);
        setEmail(data.email);
        setPhone(data.phone);
        setAddress(data.address);
      } catch (err) {
        notify(err instanceof ApiError ? err.message : "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, notify]);

  const handleSave = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await customersApi.update(user.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      updateProfile({ full_name: fullName.trim() });
      notify("Profile updated.");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack sx={{ py: 4, alignItems: "center" }}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (!customer) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Stack spacing={2}>
        <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={fullName.trim() === "" || submitting}
          sx={{ alignSelf: "flex-start" }}
        >
          Save Changes
        </Button>
      </Stack>
    </Paper>
  );
}
