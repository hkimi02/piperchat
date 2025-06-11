import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import apiClient from '@/services/apiClient';

const AuthenticatedNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-muted/30 shadow-sm">
      <div className="flex h-14 items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-foreground">
            Piperchat
          </span>
        </Link>
        <Button
          variant="outline"
          className="flex items-center gap-x-2"
          onClick={() => {
            localStorage.removeItem('token');
            apiClient.post('/auth/logout').then(() => {
              window.location.href = '/login';
            });
          }}
        >
          Déconnexion
        </Button>
      </div>
    </header>
  );
};

export default AuthenticatedNavbar;
