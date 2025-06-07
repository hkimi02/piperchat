// src/pages/auth/components/UserDetailsForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

interface UserDetailsFormProps {
  onSubmit: (formData: UserDetailsFormData) => void;
  submitButtonText?: string;
}

export interface UserDetailsFormData {
  fullName: string;
  email: string;
  password_raw: string; // Use _raw to indicate it's not yet hashed
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ 
  onSubmit, 
  submitButtonText = "Créer le Compte" 
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password_raw, setPassword_raw] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password_raw !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordError('');
    onSubmit({ fullName, email, password_raw });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Votre nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full"
        />
      </div>
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
        <Label htmlFor="password_raw">Mot de passe</Label>
        <Input
          id="password_raw"
          type="password"
          placeholder="Choisissez un mot de passe sécurisé"
          value={password_raw}
          onChange={(e) => setPassword_raw(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Retapez votre mot de passe"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (passwordError && password_raw === e.target.value) {
              setPasswordError('');
            }
          }}
          required
          className="w-full"
        />
        {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg">
        {submitButtonText} <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </form>
  );
};

export default UserDetailsForm;
