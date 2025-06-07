// src/router/components/PublicRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Dummy authentication check - replace with your actual auth logic
const useAuth = () => {
  // For demonstration, let's assume a simple check.
  // In a real app, this would involve checking a token, context, or state management store.
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Example
  return { isAuthenticated };
};

interface PublicRouteProps {
  redirectPath?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ redirectPath = '/dashboard' }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />; // Render child routes if not authenticated
};

export default PublicRoute;
