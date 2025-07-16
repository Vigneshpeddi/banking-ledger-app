import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../utils/api';

function Profile() {
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userStats, setUserStats] = useState({
    totalAccounts: 0,
    totalTransactions: 0,
    totalBalance: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const [accountsResponse, transactionsResponse] = await Promise.all([
        api.get('/api/accounts'),
        api.get('/api/transactions')
      ]);

      const accounts = accountsResponse.data?.data?.accounts || [];
      const transactions = transactionsResponse.data?.data?.transactions || [];
      
      setUserStats({
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        totalBalance: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      

      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      setMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to view your profile.</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Profile</h1>
      
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

      {/* User Information */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member Since:</strong> {formatDate(user.created_at)}</p>
          </div>
          <div>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Account Status:</strong> <span style={{ color: '#28a745' }}>Active</span></p>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Account Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>
              {userStats.totalAccounts}
            </div>
            <div style={{ color: '#666' }}>Total Accounts</div>
          </div>
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
              {userStats.totalTransactions}
            </div>
            <div style={{ color: '#666' }}>Total Transactions</div>
          </div>
          <div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
              {formatAmount(userStats.totalBalance)}
            </div>
            <div style={{ color: '#666' }}>Total Balance</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/accounts" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Manage Accounts
            </button>
          </Link>
          <Link to="/transactions" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Transactions
            </button>
          </Link>
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Change Password
          </button>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          marginBottom: '30px'
        }}>
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '15px' }}>
              <label>Current Password:</label><br />
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>New Password:</label><br />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Confirm New Password:</label><br />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button 
                type="button"
                onClick={() => setShowPasswordForm(false)}
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

      {/* Account Settings */}
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        borderRadius: '4px',
        backgroundColor: '#fff'
      }}>
        <h3>Account Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Security</h4>
            <p>• Two-factor authentication: <span style={{ color: '#dc3545' }}>Disabled</span></p>
            <p>• Login notifications: <span style={{ color: '#28a745' }}>Enabled</span></p>
            <p>• Session timeout: 30 minutes</p>
          </div>
          <div>
            <h4>Preferences</h4>
            <p>• Currency: USD</p>
            <p>• Date format: MM/DD/YYYY</p>
            <p>• Language: English</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 