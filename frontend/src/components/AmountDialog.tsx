import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface Props {
  open: boolean;
  title: string;
  confirmLabel: string;
  onClose: () => void;
  onSubmit: (amount: string) => Promise<void>;
}

export default function AmountDialog({ open, title, confirmLabel, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(amount.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          fullWidth
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!amount.trim() || submitting} onClick={handleSubmit}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
