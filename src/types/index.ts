export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  account_type: 'checking' | 'savings';
  name: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  from_account_id?: number;
  to_account_id: number;
  amount: number;
  description?: string;
  transaction_type: 'transfer' | 'deposit' | 'withdrawal';
  created_at: string;
}

export interface LedgerEntry {
  id: number;
  transaction_id: number;
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateAccountRequest {
  account_type: 'checking' | 'savings';
  name: string;
}

export interface CreateTransactionRequest {
  from_account_id?: number;
  to_account_id: number;
  amount: number;
  description?: string;
  transaction_type: 'transfer' | 'deposit' | 'withdrawal';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 