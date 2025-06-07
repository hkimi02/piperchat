// src/router/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Re-using the same dummy authentication check
const useAuth = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Example
  return { isAuthenticated };
};

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />; // Render child routes if authenticated
};

export default ProtectedRoute;
