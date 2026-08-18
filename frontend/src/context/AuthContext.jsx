import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../api/authApi';
import apiClient from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await fetchCurrentUser();
          // Extract user from wrapped response or use direct response
          const userObj = response.data || response.user || response;
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (error) {
          console.error("Failed to fetch user:", error);
          // If fetch fails but we have a token, we might decode the JWT instead of logging out
          // To preserve resilience against backend downtime, we only logout on 401s handled by interceptors
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      // Handle both wrapped (real backend) and unwrapped (mock) responses
      const token = response.data?.token || response.token;
      const userObj = response.data?.user || response.user;

      if (!token || !userObj) {
        return { success: false, message: 'Invalid response format from server' };
      }

      setToken(token);
      setUser(userObj);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    role: user?.role,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
