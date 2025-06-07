// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-24 w-24 text-destructive mb-6" />
        <h1 className="text-6xl font-bold text-destructive mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-3">Page Non Trouvée</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
        <Button asChild size="lg">
          <Link to="/">Retourner à l'Accueil</Link>
        </Button>
      </div>
      <footer className="absolute bottom-6 text-sm text-muted-foreground">
        Piperchat &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default NotFoundPage;
