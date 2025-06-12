import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '@/slices/authSlice';
import { login } from '@/services/Auth/authService';
import Loader from "@/components/ui/loader.tsx";


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      console.log(response.status==='ok');
      if (response.status === 'ok') {
      const user= response?.user;
        const access_token = response?.access_token;
        console.log("user:", user, "access_token:", access_token);
        if (access_token != null) {
          localStorage.setItem('token', access_token);
        }
        console.log("user:", user, "access_token:", access_token);
        // Dispatch loginSuccess to update Redux state
        dispatch(loginSuccess({ user, access_token }));
        navigate('/dashboard');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      // Dispatch loginFailure to update Redux state
      dispatch(loginFailure(err.message || 'Échec de la connexion. Vérifiez vos informations.'));
      if (err.message.includes('Email not verified')) {
        navigate('/verify-email', { state: { email } });
      } else {
        setError(err.message || 'Échec de la connexion. Vérifiez vos informations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 lg:p-8">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                      <span>Connexion...</span>
                  ) : (
                      'Se Connecter'
                  )}
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
              <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
        <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
  );
};

export default LoginPage;