import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { MessageSquare, Menu, X } from 'lucide-react';
import { type RootState } from '@/store/store';

const GuestNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">
            Piperchat
          </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-x-2">
            {isAuthenticated ? (
                <Button asChild size="sm">
                  <Link to="/dashboard">Accéder à l'application</Link>
                </Button>
            ) : (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link to="/login">Connexion</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Inscription</Link>
                  </Button>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
            ) : (
                <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-3">
                  <Link
                      to="/features"
                      className="text-foreground/60 transition-colors hover:text-foreground/80 py-2"
                      onClick={closeMobileMenu}
                  >
                    Fonctionnalités
                  </Link>
                  <Link
                      to="/pricing"
                      className="text-foreground/60 transition-colors hover:text-foreground/80 py-2"
                      onClick={closeMobileMenu}
                  >
                    Tarifs
                  </Link>
                  <Link
                      to="/about"
                      className="text-foreground/60 transition-colors hover:text-foreground/80 py-2"
                      onClick={closeMobileMenu}
                  >
                    À Propos
                  </Link>
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-y-2 pt-4 border-t border-border/40">
                  {isAuthenticated ? (
                      <Button asChild onClick={closeMobileMenu}>
                        <Link to="/dashboard">Accéder à l'application</Link>
                      </Button>
                  ) : (
                      <>
                        <Button variant="ghost" asChild onClick={closeMobileMenu}>
                          <Link to="/login">Connexion</Link>
                        </Button>
                        <Button asChild onClick={closeMobileMenu}>
                          <Link to="/register">Inscription</Link>
                        </Button>
                      </>
                  )}
                </div>
              </div>
            </div>
        )}
      </header>
  );
};

export default GuestNavbar;