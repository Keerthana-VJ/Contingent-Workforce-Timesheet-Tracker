import axios from 'axios';
import { setupMockAdapter } from './mock/mockAdapter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup mock adapter if fallback is enabled
if (USE_MOCK) {
  console.warn('Mock API fallback is ENABLED.');
  setupMockAdapter(apiClient);
}

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
