import { api } from "./client";
import type { Account, CloseAccountResult, OpenAccountPayload, Transaction } from "../types";

export const accountsApi = {
  open: (payload: OpenAccountPayload) => api.post<Account>("/api/v1/accounts", payload),
  forCustomer: (customerId: string) =>
    api.get<Account[]>(`/api/v1/customers/${customerId}/accounts`),
  listAll: () => api.get<Account[]>("/api/v1/accounts"),
  deposit: (accountNumber: string, amount: string) =>
    api.post<Account>(`/api/v1/accounts/${accountNumber}/deposit`, { amount }),
  withdraw: (accountNumber: string, amount: string) =>
    api.post<Account>(`/api/v1/accounts/${accountNumber}/withdraw`, { amount }),
  transactions: (accountNumber: string) =>
    api.get<Transaction[]>(`/api/v1/accounts/${accountNumber}/transactions`),
  close: (accountNumber: string) => api.delete<CloseAccountResult>(`/api/v1/accounts/${accountNumber}`),
};
