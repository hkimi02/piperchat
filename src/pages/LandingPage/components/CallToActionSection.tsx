// src/pages/LandingPage/components/CallToActionSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react'; // Example icons

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <Gift className="w-16 h-16 mx-auto mb-6 text-yellow-300" /> {/* Gift icon for "free" */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à Transformer Votre Façon de Travailler ?
          </h2>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 opacity-90">
            Rejoignez des milliers d'équipes qui font confiance à Piperchat pour une gestion de projet simplifiée et une collaboration améliorée.
          </p>
          <Button
            size="lg"
            variant="secondary" // Using secondary variant for contrast on primary background
            className="text-primary hover:bg-secondary/90 shadow-2xl transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to="/register">
              Inscrivez-vous Gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-sm opacity-80">
            Aucune carte de crédit requise. Commencez en quelques minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
