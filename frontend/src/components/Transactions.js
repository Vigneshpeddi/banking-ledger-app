import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Transaction form states
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState('transfer');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/transactions');
      console.log('Transactions Response:', response.data);
      
      const transactionsData = response.data?.data?.transactions || response.data?.data || [];
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessage('Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/accounts');
      const accountsData = response.data?.data?.accounts || response.data?.data || [];
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '/api/transactions';
      let payload = {};

      switch (transactionType) {
        case 'transfer':
          payload = {
            from_account_id: parseInt(fromAccountId),
            to_account_id: parseInt(toAccountId),
            amount: parseFloat(amount),
            description,
            transaction_type: 'transfer'
          };
          break;
        case 'deposit':
          endpoint = '/api/transactions/deposit';
          payload = {
            to_account_id: parseInt(toAccountId),
            amount: parseFloat(amount),
            description
          };
          break;
        case 'withdrawal':
          endpoint = '/api/transactions/withdrawal';
          payload = {
            from_account_id: parseInt(fromAccountId),
            amount: parseFloat(amount),
            description
          };
          break;
        default:
          return;
      }

      const response = await api.post(endpoint, payload);
      setMessage('Transaction created successfully!');
      
      // Reset form
      setFromAccountId('');
      setToAccountId('');
      setAmount('');
      setDescription('');
      setShowForm(false);
      
      // Refresh data
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage(`Failed to create transaction: ${error.response?.data?.error || error.message}`);
    }
  };

  // FIXME: This should be in a utils file
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatAmount = (amount) => {
    // TODO: Make this consistent with Accounts.js
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'transfer': return 'Transfer';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      default: return type;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Transactions</h2>
      
      {/* Create Transaction Button */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ 
          marginBottom: '20px', 
          padding: '10px 20px',
          backgroundColor: showForm ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showForm ? 'Cancel' : 'Create New Transaction'}
      </button>

      {/* Transaction Form */}
      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Create Transaction</h3>
          <form onSubmit={handleCreateTransaction}>
            <div style={{ marginBottom: '15px' }}>
              <label>Transaction Type:</label><br />
              <select 
                value={transactionType} 
                onChange={(e) => setTransactionType(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="transfer">Transfer</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            {transactionType !== 'deposit' && (
              <div style={{ marginBottom: '15px' }}>
                <label>From Account:</label><br />
                <select 
                  value={fromAccountId} 
                  onChange={(e) => setFromAccountId(e.target.value)}
                  required={transactionType !== 'deposit'}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_type}) - ${acc.balance}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {transactionType !== 'withdrawal' && (
              <div style={{ marginBottom: '15px' }}>
                <label>To Account:</label><br />
                <select 
                  value={toAccountId} 
                  onChange={(e) => setToAccountId(e.target.value)}
                  required={transactionType !== 'withdrawal'}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_type}) - ${acc.balance}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label>Amount:</label><br />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="0.00"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Description:</label><br />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="Transaction description (optional)"
                maxLength="200"
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create Transaction
            </button>
          </form>
        </div>
      )}

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: message.includes('successfully') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div>
          <h3>Transaction History</h3>
          {Array.isArray(transactions) && transactions.length > 0 ? (
            <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              {transactions.map(transaction => (
                <Link 
                  key={transaction.id} 
                  to={`/transactions/${transaction.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div 
                    style={{ 
                      padding: '15px', 
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{getTransactionTypeLabel(transaction.transaction_type)}</strong>
                        {transaction.description && (
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            {transaction.description}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {formatDate(transaction.created_at)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          ID: {transaction.id} • Click to view details →
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          color: transaction.transaction_type === 'withdrawal' ? '#dc3545' : '#28a745'
                        }}>
                          {transaction.transaction_type === 'withdrawal' ? '-' : '+'}{formatAmount(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No transactions found. Create your first transaction above!</p>
          )}
        </div>
      )}
      
      {/* TODO: Add transaction filtering and search */}
      {/* TODO: Add export functionality */}
    </div>
  );
}

export default Transactions; 