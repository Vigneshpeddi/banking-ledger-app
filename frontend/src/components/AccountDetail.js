import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionType, setQuickActionType] = useState('');
  const [quickActionAmount, setQuickActionAmount] = useState('');
  const [quickActionDescription, setQuickActionDescription] = useState('');

  useEffect(() => {
    fetchAccountData();
  }, [id]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      // Fetch account details and statement in parallel
      const [accountResponse, statementResponse] = await Promise.all([
        api.get(`/api/accounts/${id}`),
        api.get(`/api/accounts/${id}/statement?limit=50`)
      ]);

      setAccount(accountResponse.data.data.account);
      setTransactions(statementResponse.data.data.transactions || []);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setMessage('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let payload = {};

      switch (quickActionType) {
        case 'deposit':
          endpoint = '/api/transactions/deposit';
          payload = {
            to_account_id: parseInt(id),
            amount: parseFloat(quickActionAmount),
            description: quickActionDescription
          };
          break;
        case 'withdrawal':
          endpoint = '/api/transactions/withdrawal';
          payload = {
            from_account_id: parseInt(id),
            amount: parseFloat(quickActionAmount),
            description: quickActionDescription
          };
          break;
        default:
          return;
      }

      await api.post(endpoint, payload);
      setMessage(`${quickActionType.charAt(0).toUpperCase() + quickActionType.slice(1)} successful!`);
      
      // Reset form
      setQuickActionAmount('');
      setQuickActionDescription('');
      setShowQuickActions(false);
      
      // Refresh data
      fetchAccountData();
    } catch (error) {
      console.error('Error processing transaction:', error);
      setMessage(`Failed to process ${quickActionType}: ${error.response?.data?.error || error.message}`);
    }
  };

  // FIXME: Should be consistent with other components
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
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
        <p>Loading account details...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Account not found.</p>
        <Link to="/accounts">Back to Accounts</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>{account.name}</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            {account.account_type} Account • Created {new Date(account.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link to="/accounts" style={{ textDecoration: 'none' }}>
          <button style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Back to Accounts
          </button>
        </Link>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: message.includes('successful') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      {/* Account Overview */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2>Current Balance</h2>
        <div style={{ fontSize: '3em', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
          {formatAmount(account.balance)}
        </div>
        <p style={{ color: '#666' }}>Account ID: {account.id}</p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              setQuickActionType('deposit');
              setShowQuickActions(true);
            }}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💰 Deposit
          </button>
          <button 
            onClick={() => {
              setQuickActionType('withdrawal');
              setShowQuickActions(true);
            }}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💸 Withdraw
          </button>
          <Link to="/transactions" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              🔄 Transfer
            </button>
          </Link>
        </div>

        {/* Quick Action Form */}
        {showQuickActions && (
          <div style={{ 
            border: '1px solid #ddd', 
            padding: '20px', 
            marginTop: '20px',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>{quickActionType.charAt(0).toUpperCase() + quickActionType.slice(1)}</h4>
            <form onSubmit={handleQuickAction}>
              <div style={{ marginBottom: '15px' }}>
                <label>Amount:</label><br />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quickActionAmount}
                  onChange={(e) => setQuickActionAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  placeholder="0.00"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description (optional):</label><br />
                <input
                  type="text"
                  value={quickActionDescription}
                  onChange={(e) => setQuickActionDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  placeholder="Transaction description"
                  maxLength="200"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  Confirm {quickActionType.charAt(0).toUpperCase() + quickActionType.slice(1)}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowQuickActions(false)}
                  style={{ 
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div>
        <h3>Transaction History</h3>
        {transactions.length > 0 ? (
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            {transactions.map(transaction => (
              <div 
                key={transaction.id}
                style={{ 
                  padding: '15px', 
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#fff'
                }}
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
                      Transaction ID: {transaction.id}
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
            ))}
          </div>
        ) : (
          <p>No transactions found for this account.</p>
        )}
      </div>
      
      {/* TODO: Add transaction filtering */}
      {/* TODO: Add export functionality */}
      {/* TODO: Add account settings */}
    </div>
  );
}

export default AccountDetail; 