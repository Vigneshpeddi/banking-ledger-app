import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function HealthCheck() {
  const [status, setStatus] = useState('Checking...');
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      setStatus('Checking...');
      setError(null);
      
      const response = await api.get('/health');
      setStatus(`Backend is healthy!`);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setStatus('Backend connection failed');
      setError({
        message: err.message,
        code: err.code,
        status: err.response?.status
      });
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      margin: '20px'
    }}>
      <h3>Backend Health Check</h3>
      <p><strong>Status:</strong> {status}</p>
      {lastCheck && <p><strong>Last Check:</strong> {lastCheck}</p>}
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '10px',
          marginTop: '10px'
        }}>
          <strong>Error Details:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Message: {error.message}</li>
            <li>Code: {error.code || 'N/A'}</li>
            <li>Status: {error.status || 'N/A'}</li>
          </ul>
        </div>
      )}
      
      <button 
        onClick={checkHealth}
        style={{ 
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Check Again
      </button>
    </div>
  );
}

export default HealthCheck; 