import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfileApi, loginCustomerApi, logoutCustomerApi, registerCustomerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check auth state on initial mount by fetching /customers/me
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfileApi();
      setUser(data);
      setAuthError(null);
    } catch (err) {
      setUser(null);
      // Not logged in or expired token - normal for unauthenticated state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await loginCustomerApi(credentials);
      // After login cookie is set, fetch the user profile
      const profile = await getProfileApi();
      setUser(profile);
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid Credentials';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (formData) => {
    setAuthError(null);
    try {
      const data = await registerCustomerApi(formData);
      return { success: true, message: data.message, customer: data.customer };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutCustomerApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    authError,
    login,
    register,
    logout,
    checkAuth,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
