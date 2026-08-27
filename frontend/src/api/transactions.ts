import { api } from "./client";
import type { TransferPayload, TransferResult } from "../types";

export const transactionsApi = {
  transfer: (payload: TransferPayload) =>
    api.post<TransferResult>("/api/v1/transactions/transfer", payload),
};
