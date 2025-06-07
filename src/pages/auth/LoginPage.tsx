// src/pages/auth/LoginPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react'; // Piperchat icon

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here
    console.log('Login form submitted');
    // On successful login, navigate to dashboard (placeholder for now)
    // navigate('/dashboard'); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
              <span className="ml-2 text-3xl font-bold text-primary">Piperchat</span>
            </div>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace de collaboration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Se Connecter
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                S'inscrire
              </Link>
            </p>
            <Link to="/forgot-password" // We can add this page later
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
      <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
        &larr; Retour à l'accueil
      </Link>
    </div>
  );
};

export default LoginPage;
