import React from 'react';
import { Outlet } from 'react-router-dom';
import GuestNavbar from '@/components/layout/GuestNavbar'; // Import the navbar

const GuestLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col"> {/* bg-background and text-foreground are usually applied to body by shadcn/ui setup */}
      <GuestNavbar /> {/* Add the navbar here */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="py-8 text-sm text-muted-foreground border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-center md:text-left">
              Piperchat &copy; {new Date().getFullYear()} - Tous droits réservés.
            </p>
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2" aria-label="Footer navigation">
              {/* Use Link component from react-router-dom if these are internal routes */}
              <a href="/about" className="hover:text-foreground transition-colors">À Propos</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Conditions d'utilisation</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestLayout;
