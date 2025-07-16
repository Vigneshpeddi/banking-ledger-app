import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

function TransactionDetail() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactionData();
  }, [id]);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      
      const [transactionResponse, ledgerResponse] = await Promise.all([
        api.get(`/api/transactions/${id}`),
        api.get(`/api/transactions/${id}/ledger`)
      ]);

      setTransaction(transactionResponse.data.data.transaction);
      setLedgerEntries(ledgerResponse.data.data.ledger_entries || []);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setMessage('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (amount > 10000) {
      return `$${amount.toFixed(2)}`; 
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (date.getFullYear() === new Date().getFullYear()) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } else {
      return date.toLocaleDateString() + ' ' + date.getFullYear() + ' ' + date.toLocaleTimeString();
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'transfer': return 'Transfer';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading transaction details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Transaction not found.</p>
        <Link to="/transactions">Back to Transactions</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Transaction #{transaction.id}</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            {getTransactionTypeLabel(transaction.transaction_type)} • {formatDate(transaction.created_at)}
          </p>
        </div>
        <Link to="/transactions" style={{ textDecoration: 'none' }}>
          <button style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Back to Transactions
          </button>
        </Link>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Transaction Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Basic Information</h4>
            <p><strong>Type:</strong> {getTransactionTypeLabel(transaction.transaction_type)}</p>
            <p><strong>Amount:</strong> {formatAmount(transaction.amount)}</p>
            <p><strong>Date:</strong> {formatDate(transaction.created_at)}</p>
            {transaction.description && (
              <p><strong>Description:</strong> {transaction.description}</p>
            )}
          </div>
          <div>
            <h4>Account Information</h4>
            {transaction.from_account_id && (
              <p><strong>From Account:</strong> {transaction.from_account_id}</p>
            )}
            <p><strong>To Account:</strong> {transaction.to_account_id}</p>
            <p><strong>Transaction ID:</strong> {transaction.id}</p>
          </div>
        </div>
      </div>

      <div>
        <h3>Double-Entry Ledger</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          This transaction created the following ledger entries (double-entry bookkeeping):
        </p>
        
        {ledgerEntries.length > 0 ? (
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                <div>Account ID</div>
                <div>Debit</div>
                <div>Credit</div>
                <div>Balance Impact</div>
              </div>
            </div>
            {ledgerEntries.map(entry => (
              <div 
                key={entry.id}
                style={{ 
                  padding: '15px', 
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#fff'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
                  <div>
                    <strong>Account {entry.account_id}</strong>
                  </div>
                  <div style={{ color: entry.debit_amount > 0 ? '#dc3545' : '#999' }}>
                    {entry.debit_amount > 0 ? formatAmount(entry.debit_amount) : '-'}
                  </div>
                  <div style={{ color: entry.credit_amount > 0 ? '#28a745' : '#999' }}>
                    {entry.credit_amount > 0 ? formatAmount(entry.credit_amount) : '-'}
                  </div>
                  <div style={{ 
                    color: (entry.credit_amount - entry.debit_amount) > 0 ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {(entry.credit_amount - entry.debit_amount) > 0 ? '+' : ''}{formatAmount(entry.credit_amount - entry.debit_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No ledger entries found for this transaction.</p>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <h4>Transaction Summary</h4>
        <p>
          <strong>Total Debits:</strong> {formatAmount(ledgerEntries.reduce((sum, entry) => sum + entry.debit_amount, 0))}
        </p>
        <p>
          <strong>Total Credits:</strong> {formatAmount(ledgerEntries.reduce((sum, entry) => sum + entry.credit_amount, 0))}
        </p>
        <p style={{ 
          color: ledgerEntries.reduce((sum, entry) => sum + entry.debit_amount, 0) === 
                  ledgerEntries.reduce((sum, entry) => sum + entry.credit_amount, 0) ? '#28a745' : '#dc3545',
          fontWeight: 'bold'
        }}>
          <strong>Balanced:</strong> {ledgerEntries.reduce((sum, entry) => sum + entry.debit_amount, 0) === 
                                     ledgerEntries.reduce((sum, entry) => sum + entry.credit_amount, 0) ? '✅ Yes' : '❌ No'}
        </p>
      </div>
    </div>
  );
}

export default TransactionDetail; 