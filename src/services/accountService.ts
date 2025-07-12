import { runQuery, getRow, getAll } from '../database/connection';
import { Account, CreateAccountRequest } from '../types';

export class AccountService {
  static async createAccount(userId: number, accountData: CreateAccountRequest): Promise<Account> {
    const { account_type, name } = accountData;

    if (!['checking', 'savings'].includes(account_type)) {
      throw new Error('Invalid account type. Must be "checking" or "savings"');
    }

    const result = await runQuery(
      'INSERT INTO accounts (user_id, account_type, name, balance) VALUES (?, ?, ?, ?)',
      [userId, account_type, name, 0.00]
    );

    const account = await getRow(
      'SELECT id, user_id, account_type, name, balance, created_at FROM accounts WHERE id = ?',
      [result.id]
    );

    return {
      id: account.id,
      user_id: account.user_id,
      account_type: account.account_type,
      name: account.name,
      balance: account.balance,
      created_at: account.created_at
    };
  }

  static async getUserAccounts(userId: number): Promise<Account[]> {
    const accounts = await getAll(
      'SELECT id, user_id, account_type, name, balance, created_at FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return accounts.map(account => ({
      id: account.id,
      user_id: account.user_id,
      account_type: account.account_type,
      name: account.name,
      balance: account.balance,
      created_at: account.created_at
    }));
  }

  static async getAccountById(accountId: number, userId: number): Promise<Account | null> {
    const account = await getRow(
      'SELECT id, user_id, account_type, name, balance, created_at FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, userId]
    );

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      user_id: account.user_id,
      account_type: account.account_type,
      name: account.name,
      balance: account.balance,
      created_at: account.created_at
    };
  }

  static async calculateAccountBalance(accountId: number): Promise<number> {
    const result = await getRow(
      `SELECT COALESCE(SUM(credit_amount - debit_amount), 0) as balance 
       FROM ledger_entries 
       WHERE account_id = ?`,
      [accountId]
    );

    return parseFloat(result.balance || 0);
  }

  static async updateAccountBalance(accountId: number): Promise<void> {
    const balance = await this.calculateAccountBalance(accountId);
    
    await runQuery(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [balance, accountId]
    );
  }

  static async getAccountWithBalance(accountId: number, userId: number): Promise<Account | null> {
    const account = await this.getAccountById(accountId, userId);
    
    if (!account) {
      return null;
    }

    const currentBalance = await this.calculateAccountBalance(accountId);
    
    return {
      ...account,
      balance: currentBalance
    };
  }

  static async getAccountStatement(accountId: number, userId: number, limit: number = 30): Promise<any[]> {
    const account = await this.getAccountById(accountId, userId);
    if (!account) {
      throw new Error('Account not found or access denied');
    }

    const transactions = await getAll(
      `SELECT 
        t.id,
        t.from_account_id,
        t.to_account_id,
        t.amount,
        t.description,
        t.transaction_type,
        t.created_at,
        from_acc.name as from_account_name,
        to_acc.name as to_account_name
       FROM transactions t
       LEFT JOIN accounts from_acc ON t.from_account_id = from_acc.id
       LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
       WHERE t.from_account_id = ? OR t.to_account_id = ?
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [accountId, accountId, limit]
    );

    return transactions.map(tx => ({
      id: tx.id,
      from_account_id: tx.from_account_id,
      to_account_id: tx.to_account_id,
      amount: tx.amount,
      description: tx.description,
      transaction_type: tx.transaction_type,
      created_at: tx.created_at,
      from_account_name: tx.from_account_name,
      to_account_name: tx.to_account_name,
      is_debit: tx.from_account_id === accountId,
      is_credit: tx.to_account_id === accountId
    }));
  }

  static async validateAccountOwnership(accountId: number, userId: number): Promise<boolean> {
    const account = await getRow(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, userId]
    );

    return !!account;
  }
} 