import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TransactionHistoryPanel from "./TransactionHistoryPanel";

interface Props {
  open: boolean;
  accountNumber: string | null;
  onClose: () => void;
}

export default function TransactionHistoryDialog({ open, accountNumber, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Transaction History {accountNumber ? `— ${accountNumber}` : ""}</DialogTitle>
      <DialogContent>
        {open && <TransactionHistoryPanel accountNumber={accountNumber} />}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
