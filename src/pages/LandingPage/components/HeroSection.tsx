// src/pages/LandingPage/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react'; // Example icons

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 text-center bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-primary">Piperchat:</span> Votre Allié pour une Collaboration d'Équipe Fluide
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Organisez vos projets, centralisez vos tâches et communiquez efficacement.
            Piperchat simplifie la gestion de travail pour les équipes modernes.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
            <Link to="/register">
              Commencer Gratuitement
              <Rocket className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="shadow-lg hover:shadow-accent/30 transition-shadow">
            <Link to="/login"> {/* Link to a future "How it Works" section */}
              Connexion
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
