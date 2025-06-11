import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AuthenticatedNavbar />
      <main className="flex-grow overflow-y-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
