import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { transactionsApi } from "../api/transactions";
import { ApiError } from "../api/client";
import { useNotify } from "../NotificationContext";
import type { TransferResult } from "../types";

export default function TransferPage() {
  const notify = useNotify();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);

  const canSubmit = fromAccount.trim() !== "" && toAccount.trim() !== "" && amount.trim() !== "";

  const handleTransfer = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await transactionsApi.transfer({
        from_account_number: fromAccount.trim(),
        to_account_number: toAccount.trim(),
        amount: amount.trim(),
      });
      setResult(data);
      notify(`Transferred $${Number(amount).toFixed(2)}.`);
      setAmount("");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Transfer failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Transfer Funds
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="From Account Number"
            placeholder="ACC1001"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            fullWidth
          />
          <TextField
            label="To Account Number"
            placeholder="ACC1002"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<SwapHorizIcon />}
            disabled={!canSubmit || submitting}
            onClick={handleTransfer}
          >
            Transfer
          </Button>
        </Stack>

        {result && (
          <>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {result.from_account.account_number}
                </Typography>
                <Typography variant="h6">${Number(result.from_account.balance).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  {result.to_account.account_number}
                </Typography>
                <Typography variant="h6">${Number(result.to_account.balance).toFixed(2)}</Typography>
              </Box>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
