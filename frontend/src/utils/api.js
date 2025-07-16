import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include credentials for CORS
});

// Request interceptor with debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server might be slow');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if backend is running');
    } else if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 0) {
      console.error('🚫 CORS or connection error - check backend CORS settings');
    }

    return Promise.reject(error);
  }
);

// Retry function for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Retry ${i + 1}/${maxRetries} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error; // Last retry failed
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// TODO: Add request caching
// TODO: Add offline support
// FIXME: Sometimes the token gets cleared unexpectedly

export default api; 