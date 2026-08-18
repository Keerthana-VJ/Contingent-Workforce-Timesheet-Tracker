import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their respective dashboard if they try to access unauthorized routes
    const rolePath = role ? `/${role.toLowerCase()}/dashboard` : '/login';
    return <Navigate to={rolePath} replace />;
  }

  return <Outlet />;
};
