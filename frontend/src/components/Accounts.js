import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/accounts');
      console.log('API Response:', response.data); // Debug log
      
      // Backend returns: { success: true, data: { accounts: [...] } }
      const accountsData = response.data?.data?.accounts || response.data?.data || [];
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setMessage('Failed to fetch accounts');
      setAccounts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/accounts', { name, account_type: type });
      setMessage('Account created!');
      setName('');
      setType('checking');
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      setMessage('Failed to create account');
    }
  };

  // TODO: Move this to a utils file later
  const formatAmount = (amount) => {
    // Quick fix for now - should use a proper currency formatter
    if (amount > 1000) {
      return `$${amount.toFixed(2)}`; // Inconsistent formatting for large amounts
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Your Accounts
        </h2>
        
        {/* FIXME: Form validation could be better */}
        <form onSubmit={handleCreate} style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Account Name
            </label>
            <input
              type="text"
              placeholder="Enter account name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ minWidth: '150px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Account Type
            </label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: '600',
              minWidth: '140px'
            }}
          >
            Create Account
          </button>
        </form>
      </div>
      
      {message && (
        <div className="card" style={{ 
          backgroundColor: message.includes('created') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('created') ? '#c3e6cb' : '#f5c6cb'}`,
          color: message.includes('created') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}
      
      {loading ? (
        <div className="card text-center">
          <p style={{ margin: '0', color: '#6c757d' }}>Loading accounts...</p>
        </div>
      ) : (
        <div>
          {Array.isArray(accounts) && accounts.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {accounts.map(acc => (
                <Link 
                  key={acc.id} 
                  to={`/accounts/${acc.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ 
                    cursor: 'pointer',
                    border: '1px solid #e9ecef',
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {acc.name}
                        </h3>
                        <div style={{ 
                          color: '#6c757d', 
                          fontSize: '14px',
                          textTransform: 'capitalize',
                          marginBottom: '4px'
                        }}>
                          {acc.account_type} Account
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          ID: {acc.id}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#28a745',
                          marginBottom: '4px'
                        }}>
                          {formatAmount(acc.balance)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#007bff',
                          fontWeight: '500'
                        }}>
                          View Details →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <p style={{ margin: '0', color: '#6c757d' }}>
                No accounts found. Create your first account above!
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* NOTE: Planning to add account deletion feature later */}
      {/* <button>Delete Account</button> */}
    </div>
  );
}

export default Accounts; 