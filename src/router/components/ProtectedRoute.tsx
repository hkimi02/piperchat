import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { me } from '@/services/Auth/authService.ts';
import { logout, refreshUser } from '@/slices/authSlice'; // Adjust the import path as needed

import NotAuthorized from '@/pages/errorPages/notAuthorized.tsx';
import Loader from "@/components/ui/loader.tsx"; // Adjust the import path as needed

interface ProtectedRouteProps {
  redirectPath?: string;
  role?: string | null; // Optional role prop to restrict access based on user role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = '/login', role = null }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated); // Adjust state type if using TypeScript with a defined state interface
  const user = useSelector((state: any) => state.auth.user); // Adjust state type if using TypeScript with a defined state interface
  const userRole = user ? user.role : null;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await me();
          const user = userData.data;
          dispatch(refreshUser({ token, user }));
        } catch (error) {
          dispatch(logout());
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if a specific role is required and if the user has that role
  if (role && userRole !== role) {
    return <NotAuthorized />;
  }

  return <Outlet />; // Render child routes if authenticated and authorized
};

export default ProtectedRoute;