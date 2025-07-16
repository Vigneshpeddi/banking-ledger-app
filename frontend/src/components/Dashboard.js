import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import HealthCheck from './HealthCheck';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch accounts and transactions in parallel
      const [accountsResponse, transactionsResponse] = await Promise.all([
        api.get('/api/accounts'),
        api.get('/api/transactions?limit=5')
      ]);

      const accountsData = accountsResponse.data?.data?.accounts || [];
      const transactionsData = transactionsResponse.data?.data?.transactions || [];

      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Move to utils file
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'transfer': return 'Transfer';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      default: return type;
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        minHeight: '100vh',
        background: '#f8f9fa'
      }}>
        <div className="card">
          <p style={{ margin: '0', color: '#6c757d' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          margin: '0 0 8px 0',
          fontSize: '32px',
          fontWeight: '700',
          color: '#333'
        }}>
          Banking Dashboard
        </h1>
        <p style={{ 
          margin: '0', 
          color: '#6c757d',
          fontSize: '16px'
        }}>
          Welcome back! Here's your financial overview.
        </p>
      </div>
      
      {/* Health Check for debugging */}
      <div style={{ marginBottom: '24px' }}>
        <HealthCheck />
      </div>
      
      {message && (
        <div className="card" style={{ 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          marginBottom: '24px'
        }}>
          {message}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#333'
        }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/accounts" style={{ textDecoration: 'none' }}>
            <button style={{ 
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px'
            }}>
              Manage Accounts
            </button>
          </Link>
          <Link to="/transactions" style={{ textDecoration: 'none' }}>
            <button style={{ 
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px'
            }}>
              View Transactions
            </button>
          </Link>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <button style={{ 
              backgroundColor: '#6c757d',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px'
            }}>
              My Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Total Balance */}
      <div className="card" style={{ 
        textAlign: 'center',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h2 style={{ 
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Total Balance
        </h2>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          {formatAmount(totalBalance)}
        </div>
        <p style={{ margin: '0', opacity: '0.9' }}>
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Accounts Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ 
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#333'
          }}>
            Your Accounts
          </h3>
          {accounts.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {accounts.map(account => (
                <Link 
                  key={account.id} 
                  to={`/accounts/${account.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div 
                    style={{ 
                      padding: '16px',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 4px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {account.name}
                        </h4>
                        <div style={{ 
                          color: '#6c757d', 
                          fontSize: '14px',
                          textTransform: 'capitalize'
                        }}>
                          {account.account_type}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#28a745'
                      }}>
                        {formatAmount(account.balance)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>
                No accounts found.
              </p>
              <Link to="/accounts" style={{ textDecoration: 'none' }}>
                <button style={{ 
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  Create Your First Account
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ 
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#333'
          }}>
            Recent Transactions
          </h3>
          {transactions.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {transactions.slice(0, 5).map(transaction => (
                <div 
                  key={transaction.id}
                  style={{ 
                    padding: '16px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ 
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </h4>
                      {transaction.description && (
                        <div style={{ 
                          color: '#6c757d', 
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          {transaction.description}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#999'
                      }}>
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: transaction.amount > 0 ? '#28a745' : '#dc3545'
                    }}>
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>
                No recent transactions.
              </p>
              <Link to="/transactions" style={{ textDecoration: 'none' }}>
                <button style={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  View All Transactions
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 