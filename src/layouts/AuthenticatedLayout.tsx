import React from 'react';
import { Outlet } from 'react-router-dom';
// import { Link } from 'react-router-dom'; // Example if using react-router
// import { Button } from '@/components/ui/button'; // Example

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col"> {/* bg-background and text-foreground from body */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              {/* <Icons.logo className="h-6 w-6" /> Replace with your logo */}
              <span className="hidden font-bold sm:inline-block text-primary">Piperchat</span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              {/* Example Nav Links */}
              {/* <Link to="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80">Tableau de bord</Link> */}
              {/* <Link to="/projects" className="text-foreground/60 transition-colors hover:text-foreground/80">Projets</Link> */}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* User menu, notifications, etc. */}
            {/* <Button variant="outline">Déconnexion</Button> */}
          </div>
        </div>
      </header>

      {/* Optional Sidebar - Example structure */}
      {/* <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 mx-auto px-4 sm:px-6 lg:px-8">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto py-6 pr-6 lg:py-8">
          <nav> {/* Sidebar navigation items * /}</nav>
        </aside>
        <main className="flex-grow py-6 md:py-8">
          {children}
        </main>
      </div> */}
       <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </main>


      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        Piperchat &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AuthenticatedLayout;
