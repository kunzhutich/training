export type AccountType = "SAVINGS" | "CHECKING";
export type Role = "ADMIN" | "CUSTOMER";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT";

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  branch_code: string | null;
  access_token: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  username: string;
  current_password: string;
  new_password: string;
}

export interface Customer {
  id: string;
  username: string;
  full_name: string;
  branch_code: string;
  is_active: boolean;
  account_numbers: string[];
  email: string;
  phone: string;
  address: string;
}

export interface Account {
  account_number: string;
  owner_id: string;
  account_type: AccountType;
  balance: string;
  opened_at: string;
  rule_description: string;
  min_balance: string | null;
  overdraft_limit: string | null;
  alert_threshold: string | null;
}

export interface Transaction {
  transaction_id: string;
  account_number: string;
  transaction_type: TransactionType;
  amount: string;
  balance_after: string;
  timestamp: string;
  related_account: string | null;
}

export interface Branch {
  branch_code: string;
  name: string;
}

export interface CreateCustomerPayload {
  username: string;
  password: string;
  full_name: string;
  branch_code: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerPayload {
  full_name?: string;
  branch_code?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface OpenAccountPayload {
  customer_id: string;
  account_type: AccountType;
  opening_balance: string;
}

export interface TransferPayload {
  from_account_number: string;
  to_account_number: string;
  amount: string;
}

export interface TransferResult {
  from_account: Account;
  to_account: Account;
}

export interface CloseAccountResult {
  account_number: string;
  payout: string;
}

export interface CreateBranchPayload {
  branch_code: string;
  name: string;
}
