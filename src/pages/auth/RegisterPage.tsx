import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import UserDetailsForm from './components/UserDetailsForm';
import type { UserDetailsFormData } from './components/UserDetailsForm';
import { register } from '@/services/Auth/authService';

// Define the possible steps in the registration process
type RegistrationStep = 'choice' | 'join_code' | 'create_org' | 'user_details_join' | 'user_details_create';

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>('choice');
  const [orgCode, setOrgCode] = useState(''); // State for organization code
  const [newOrgName, setNewOrgName] = useState(''); // State for new organization name
  const navigate = useNavigate();

  const handleUserDetailsSubmit = async (formData: UserDetailsFormData) => {
    try {
      // Split fullName into first_name and last_name
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ');

      const registerData = {
        first_name: firstName || 'Unknown',
        last_name: lastName || 'Unknown',
        email: formData.email,
        password: formData.password_raw,
      };

      if (step === 'user_details_join') {
        registerData.join_code = orgCode;
        const response = await register(registerData);
        if (response.status === 'ok') {
          console.log('Registration successful (join):', response);
          navigate('/verify-email', { state: { email: formData.email } }); // Pass email
        } else {
          throw new Error(response.message);
        }
      } else if (step === 'user_details_create') {
        registerData.organisation_name = newOrgName;
        const response = await register(registerData);
        if (response.status === 'ok') {
          console.log('Registration successful (create):', response);
          navigate('/verify-email', { state: { email: formData.email } }); // Pass email
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(`Échec de l’inscription : ${error.message || 'Veuillez vérifier vos informations et réessayer.'}`);
    }
  };

  // Function to render the current step
  const renderCurrentStep = () => {
    switch (step) {
      case 'choice':
        return (
            <motion.div
                key="choice"
                initial={{ opacity: 0, x: 300 }} // Animate from right
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }} // Animate to left on exit
                transition={{ duration: 0.3 }}
                className="w-full"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-6">
                  <MessageSquare className="h-12 w-12 text-primary" />
                  <span className="ml-3 text-4xl font-bold text-primary">Piperchat</span>
                </div>
                <CardTitle className="text-3xl font-semibold">Inscription</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-2">
                  Commencez par choisir comment vous souhaitez utiliser Piperchat.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <Button
                    variant="outline"
                    className="w-full h-28 text-lg justify-start p-6 hover:bg-accent/50 focus:ring-2 focus:ring-primary"
                    onClick={() => setStep('join_code')} // Next step: enter organization code
                >
                  <Users className="h-10 w-10 mr-6 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-xl">Rejoindre une Organisation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilisez un code d'invitation pour accéder à un espace de travail existant.
                    </p>
                  </div>
                  <ArrowRight className="h-7 w-7 ml-auto text-muted-foreground flex-shrink-0" />
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-28 text-lg justify-start p-6 hover:bg-accent/50 focus:ring-2 focus:ring-primary"
                    onClick={() => setStep('create_org')} // Next step: create new organization
                >
                  <PlusCircle className="h-10 w-10 mr-6 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-xl">Créer une Organisation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mettez en place un nouvel espace de travail pour votre équipe et invitez des collaborateurs.
                    </p>
                  </div>
                  <ArrowRight className="h-7 w-7 ml-auto text-muted-foreground flex-shrink-0" />
                </Button>
              </CardContent>
              <CardFooter className="pt-8 flex-col space-y-4">
                <p className="text-sm text-muted-foreground text-center w-full">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </motion.div>
        );
      case 'join_code':
        return (
            <motion.div
                key="join_code"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setStep('choice')} className="mr-4">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Rejoindre une Organisation</CardTitle>
                    <CardDescription className="text-md text-muted-foreground pt-1">
                      Saisissez le code d'invitation de votre organisation.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <form onSubmit={(e) => { e.preventDefault(); setStep('user_details_join'); }}>
                  <div className="space-y-2">
                    <Label htmlFor="orgCode">Code de l'organisation</Label>
                    <Input
                        id="orgCode"
                        type="text"
                        placeholder="Ex: A1B2-C3D4-E5F6"
                        value={orgCode}
                        onChange={(e) => setOrgCode(e.target.value)}
                        required
                        className="w-full text-lg p-3"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" size="lg">
                    Suivant <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="pt-6">
                <p className="text-xs text-muted-foreground text-center w-full">
                  Si vous n'avez pas de code, demandez-le à l'administrateur de votre organisation ou <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setStep('choice')}>retournez en arrière</Button> pour en créer une.
                </p>
              </CardFooter>
            </motion.div>
        );
      case 'create_org':
        return (
            <motion.div
                key="create_org"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setStep('choice')} className="mr-4">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Créer une Nouvelle Organisation</CardTitle>
                    <CardDescription className="text-md text-muted-foreground pt-1">
                      Donnez un nom à votre nouvel espace de travail.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <form onSubmit={(e) => { e.preventDefault(); setStep('user_details_create'); }}>
                  <div className="space-y-2">
                    <Label htmlFor="newOrgName">Nom de l'organisation</Label>
                    <Input
                        id="newOrgName"
                        type="text"
                        placeholder="Ex: Mon Entreprise Inc."
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        required
                        className="w-full text-lg p-3"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" size="lg">
                    Suivant <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="pt-6">
                <p className="text-xs text-muted-foreground text-center w-full">
                  Après avoir créé l'organisation, vous configurerez votre compte administrateur.
                </p>
              </CardFooter>
            </motion.div>
        );
      case 'user_details_join':
        return (
            <motion.div
                key="user_details_join"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setStep('join_code')} className="mr-4">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Finaliser votre Inscription</CardTitle>
                    <CardDescription className="text-md text-muted-foreground pt-1">
                      Vous rejoignez l'organisation avec le code : <span className="font-semibold text-primary">{orgCode || "Non spécifié"}</span>.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <UserDetailsForm
                    onSubmit={handleUserDetailsSubmit}
                    submitButtonText="Rejoindre et Créer le Compte"
                />
              </CardContent>
            </motion.div>
        );
      case 'user_details_create':
        return (
            <motion.div
                key="user_details_create"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="icon" onClick={() => setStep('create_org')} className="mr-4">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Créer votre Compte Administrateur</CardTitle>
                    <CardDescription className="text-md text-muted-foreground pt-1">
                      Pour l'organisation : <span className="font-semibold text-primary">{newOrgName || "Non spécifié"}</span>.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <UserDetailsForm
                    onSubmit={handleUserDetailsSubmit}
                    submitButtonText="Créer Organisation et Compte"
                />
              </CardContent>
            </motion.div>
        );
      default:
        return <div>Étape Inconnue</div>;
    }
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 lg:p-8">
        {/* The Card will act as the container for our steps */}
        <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
          {renderCurrentStep()}
        </Card>
        <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
  );
};

export default RegisterPage;