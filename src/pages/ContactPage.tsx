import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
    alert('Message envoyé ! (simulation)');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
          Contactez-Nous
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une question, une suggestion ou besoin d'assistance ? N'hésitez pas à nous joindre.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card p-8 rounded-lg shadow-xl space-y-6"
        >
          <h2 className="text-2xl font-semibold text-card-foreground mb-6">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Nom complet</label>
              <Input type="text" id="name" name="name" required className="w-full" placeholder="Votre nom" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Adresse e-mail</label>
              <Input type="email" id="email" name="email" required className="w-full" placeholder="Votre e-mail" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1">Sujet</label>
              <Input type="text" id="subject" name="subject" required className="w-full" placeholder="Sujet de votre message" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">Message</label>
              <Textarea id="message" name="message" rows={5} required className="w-full" placeholder="Votre message..." />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Envoyer le Message
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card p-8 rounded-lg shadow-xl space-y-8"
        >
          <h2 className="text-2xl font-semibold text-card-foreground mb-6">Nos Coordonnées</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-card-foreground">E-mail</h3>
                <a href="mailto:contact@elyes.dev" className="text-muted-foreground hover:text-primary transition-colors">
                  contact@elyes.dev
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-card-foreground">Téléphone</h3>
                <p className="text-muted-foreground">+216 55 880 847 (Support)</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-card-foreground">Adresse</h3>
                <p className="text-muted-foreground">
                  Tunis, Tunisie
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
