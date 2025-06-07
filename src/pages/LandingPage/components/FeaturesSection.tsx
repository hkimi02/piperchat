// src/pages/LandingPage/components/FeaturesSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, MessageCircle, KanbanSquare } from 'lucide-react'; // Example icons

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      className="bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: KanbanSquare,
      title: 'Gestion de Projets Intuitive',
      description: 'Organisez vos tâches avec des tableaux Kanban flexibles et suivez l\'avancement en temps réel.',
    },
    {
      icon: MessageCircle,
      title: 'Communication Centralisée',
      description: 'Discutez avec votre équipe directement au sein des projets, gardant toutes les conversations contextuelles.',
    },
    {
      icon: Users,
      title: 'Collaboration d\'Équipe',
      description: 'Invitez des membres, gérez les accès et travaillez ensemble de manière transparente sur plusieurs projets.',
    },
    {
      icon: CheckCircle, // Placeholder for a more specific icon if available
      title: 'Suivi des Tâches Efficace',
      description: 'Assignez des responsables, fixez des échéances et ne manquez plus jamais une deadline importante.',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Découvrez les Fonctionnalités Clés de <span className="text-primary">Piperchat</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour mener vos projets au succès, en un seul endroit.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
