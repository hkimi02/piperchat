import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { type RootState } from '@/store/store';

const GuestNavbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-foreground">
            Piperchat
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-grow">
          <Link
            to="/features"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Fonctionnalités
          </Link>
          <Link
            to="/pricing"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Tarifs
          </Link>
          <Link
            to="/about"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            À Propos
          </Link>
        </nav>
        <div className="flex items-center gap-x-2">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/dashboard">Accéder à l'application</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Inscription</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default GuestNavbar;
