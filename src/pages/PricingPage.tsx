// src/pages/PricingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PricingTierProps {
  name: string;
  price: string;
  frequency: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
  index: number;
}

const PricingTier: React.FC<PricingTierProps> = ({ name, price, frequency, features, isPopular, ctaText, ctaLink, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-card p-8 rounded-lg shadow-lg relative flex flex-col ${isPopular ? 'border-2 border-primary shadow-primary/30' : 'border border-border'}`}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full shadow-md">
          Populaire
        </div>
      )}
      <h3 className="text-2xl font-semibold text-center text-card-foreground mb-2">{name}</h3>
      <p className="text-center text-muted-foreground mb-6">{frequency}</p>
      <p className="text-5xl font-bold text-center text-primary mb-1">{price}</p>
      <p className="text-center text-muted-foreground mb-8">par mois</p>
      
      <ul className="space-y-3 mb-10 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-muted-foreground">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button size="lg" className="w-full mt-auto" variant={isPopular ? 'default' : 'outline'} asChild>
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>
    </motion.div>
  );
};

const PricingPage: React.FC = () => {
  const tiers = [
    {
      name: 'Basique',
      price: '0€',
      frequency: 'Pour les petites équipes et projets personnels',
      features: [
        'Jusqu\'à 3 projets',
        'Jusqu\'à 5 utilisateurs',
        'Fonctionnalités de base de gestion de tâches',
        'Support communautaire',
      ],
      ctaText: 'Commencer Gratuitement',
      ctaLink: '/register?plan=free',
      index: 0,
    },
    {
      name: 'Pro',
      price: '15€',
      frequency: 'Pour les équipes en croissance et PME',
      features: [
        'Projets illimités',
        'Utilisateurs illimités',
        'Fonctionnalités avancées (Kanban, Chat)',
        'Support prioritaire par email',
        'Analytiques de projet',
      ],
      isPopular: true,
      ctaText: 'Choisir Pro',
      ctaLink: '/register?plan=pro',
      index: 1,
    },
    {
      name: 'Entreprise',
      price: 'Contactez-nous',
      frequency: 'Pour les grandes organisations et besoins spécifiques',
      features: [
        'Toutes les fonctionnalités Pro',
        'Support dédié 24/7',
        'Fonctionnalités de sécurité avancées (SSO)',
        'Personnalisation et intégrations sur mesure',
        'Formation et onboarding',
      ],
      ctaText: 'Demander un Devis',
      ctaLink: '/contact?subject=entreprise',
      index: 2,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
          Nos Plans Tarifaires (Illustratifs)
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choisissez le plan qui correspond le mieux à vos besoins et commencez à collaborer plus efficacement dès aujourd'hui.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} // Slight delay for sequential animation
          className="mt-6 bg-accent/50 p-4 rounded-md text-accent-foreground text-sm max-w-xl mx-auto"
        >
          <p className="font-semibold">
            Note Importante : Piperchat est un projet d'étude.
          </p>
          <p className="mt-1">
            Ce projet a été développé par Elyes Ghorbel, Amine Hkimi, et Yassine Aniba pour iTeam University.
            Les plans tarifaires présentés ici sont à des fins de démonstration et d'apprentissage uniquement et ne correspondent pas à une offre commerciale réelle.
          </p>
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <PricingTier key={tier.name} {...tier} />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
