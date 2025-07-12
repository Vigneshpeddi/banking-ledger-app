import { runQuery, getRow, getAll } from '../database/connection';
import { Transaction, CreateTransactionRequest, LedgerEntry } from '../types';
import { AccountService } from './accountService';

export class TransactionService {
  static async processTransaction(userId: number, transactionData: CreateTransactionRequest): Promise<Transaction> {
    const { from_account_id, to_account_id, amount, description, transaction_type } = transactionData;

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!to_account_id) {
      throw new Error('Destination account is required');
    }

    if (from_account_id) {
      const ownsFromAccount = await AccountService.validateAccountOwnership(from_account_id, userId);
      if (!ownsFromAccount) {
        throw new Error('Access denied to source account');
      }
    }

    const ownsToAccount = await AccountService.validateAccountOwnership(to_account_id, userId);
    if (!ownsToAccount) {
      throw new Error('Access denied to destination account');
    }

    if (transaction_type === 'transfer' && from_account_id) {
      const fromAccount = await AccountService.getAccountWithBalance(from_account_id, userId);
      if (!fromAccount) {
        throw new Error('Source account not found');
      }
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }
    }

    const transactionResult = await runQuery(
      'INSERT INTO transactions (from_account_id, to_account_id, amount, description, transaction_type) VALUES (?, ?, ?, ?, ?)',
      [from_account_id, to_account_id, amount, description, transaction_type]
    );

    const transactionId = transactionResult.id;

    await this.createLedgerEntries(transactionId, from_account_id, to_account_id, amount, transaction_type);

    if (from_account_id) {
      await AccountService.updateAccountBalance(from_account_id);
    }
    await AccountService.updateAccountBalance(to_account_id);

    const transaction = await getRow(
      'SELECT id, from_account_id, to_account_id, amount, description, transaction_type, created_at FROM transactions WHERE id = ?',
      [transactionId]
    );

    return {
      id: transaction.id,
      from_account_id: transaction.from_account_id,
      to_account_id: transaction.to_account_id,
      amount: transaction.amount,
      description: transaction.description,
      transaction_type: transaction.transaction_type,
      created_at: transaction.created_at
    };
  }

  private static async createLedgerEntries(
    transactionId: number,
    fromAccountId: number | undefined,
    toAccountId: number,
    amount: number,
    transactionType: string
  ): Promise<void> {
    const ledgerEntries: Array<{ account_id: number; debit_amount: number; credit_amount: number }> = [];

    switch (transactionType) {
      case 'transfer':
        if (fromAccountId) {
          ledgerEntries.push({
            account_id: fromAccountId,
            debit_amount: amount,
            credit_amount: 0
          });
        }
        ledgerEntries.push({
          account_id: toAccountId,
          debit_amount: 0,
          credit_amount: amount
        });
        break;

      case 'deposit':
        ledgerEntries.push({
          account_id: toAccountId,
          debit_amount: 0,
          credit_amount: amount
        });
        break;

      case 'withdrawal':
        if (fromAccountId) {
          ledgerEntries.push({
            account_id: fromAccountId,
            debit_amount: amount,
            credit_amount: 0
          });
        }
        break;

      default:
        throw new Error('Invalid transaction type');
    }

    for (const entry of ledgerEntries) {
      await runQuery(
        'INSERT INTO ledger_entries (transaction_id, account_id, debit_amount, credit_amount) VALUES (?, ?, ?, ?)',
        [transactionId, entry.account_id, entry.debit_amount, entry.credit_amount]
      );
    }
  }

  static async getUserTransactions(userId: number, limit: number = 50): Promise<any[]> {
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
       WHERE from_acc.user_id = ? OR to_acc.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [userId, userId, limit]
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
      to_account_name: tx.to_account_name
    }));
  }

  static async getTransactionById(transactionId: number, userId: number): Promise<any | null> {
    const transaction = await getRow(
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
       WHERE t.id = ? AND (from_acc.user_id = ? OR to_acc.user_id = ?)`,
      [transactionId, userId, userId]
    );

    if (!transaction) {
      return null;
    }

    return {
      id: transaction.id,
      from_account_id: transaction.from_account_id,
      to_account_id: transaction.to_account_id,
      amount: transaction.amount,
      description: transaction.description,
      transaction_type: transaction.transaction_type,
      created_at: transaction.created_at,
      from_account_name: transaction.from_account_name,
      to_account_name: transaction.to_account_name
    };
  }

  static async getTransactionLedgerEntries(transactionId: number, userId: number): Promise<LedgerEntry[]> {
    const transaction = await this.getTransactionById(transactionId, userId);
    if (!transaction) {
      throw new Error('Transaction not found or access denied');
    }

    const entries = await getAll(
      `SELECT 
        le.id,
        le.transaction_id,
        le.account_id,
        le.debit_amount,
        le.credit_amount,
        le.created_at,
        a.name as account_name
       FROM ledger_entries le
       JOIN accounts a ON le.account_id = a.id
       WHERE le.transaction_id = ?
       ORDER BY le.id`,
      [transactionId]
    );

    return entries.map(entry => ({
      id: entry.id,
      transaction_id: entry.transaction_id,
      account_id: entry.account_id,
      debit_amount: entry.debit_amount,
      credit_amount: entry.credit_amount,
      created_at: entry.created_at
    }));
  }

  static validateTransactionData(data: CreateTransactionRequest): void {
    if (!data.to_account_id) {
      throw new Error('Destination account is required');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['transfer', 'deposit', 'withdrawal'].includes(data.transaction_type)) {
      throw new Error('Invalid transaction type');
    }

    if (data.transaction_type === 'transfer' && !data.from_account_id) {
      throw new Error('Source account is required for transfers');
    }

    if (data.transaction_type === 'withdrawal' && !data.from_account_id) {
      throw new Error('Source account is required for withdrawals');
    }
  }
} 