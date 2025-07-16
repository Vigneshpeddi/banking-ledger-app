import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Accounts from './components/Accounts';
import AccountDetail from './components/AccountDetail';
import Transactions from './components/Transactions';
import TransactionDetail from './components/TransactionDetail';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { UserProvider, useUser } from './context/UserContext';

function Navigation() {
  const { user, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      padding: '16px 0', 
      borderBottom: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ 
            textDecoration: 'none', 
            color: '#007bff', 
            fontWeight: '700',
            fontSize: '20px'
          }}>
            🏦 Banking App
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Dashboard
              </Link>
              <Link to="/accounts" style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Accounts
              </Link>
              <Link to="/transactions" style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Transactions
              </Link>
              <Link to="/profile" style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Profile
              </Link>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span style={{ 
                color: '#6c757d', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Welcome, {user?.name}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 16px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Login
              </Link>
              <Link to="/register" style={{ 
                textDecoration: 'none', 
                color: 'white',
                fontWeight: '600',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const { loading } = useUser();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/accounts/:id" element={<ProtectedRoute><AccountDetail /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
