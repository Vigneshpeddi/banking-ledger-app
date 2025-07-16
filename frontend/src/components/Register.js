import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../utils/api';

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      login(response.data.data.user, response.data.data.token);
      setMessage('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setMessage(`Registration failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ 
        maxWidth: '400px', 
        width: '100%', 
        margin: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        <div className="text-center mb-3">
          <h2 style={{ 
            margin: '0 0 24px 0', 
            color: '#333',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Create Account
          </h2>
          <p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>
            Join our banking platform
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="Create a password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              width: '100%',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              padding: '12px 20px'
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 16px',
            backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '6px',
            color: message.includes('successful') ? '#155724' : '#721c24',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
        
        <div className="text-center mt-3">
          <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 