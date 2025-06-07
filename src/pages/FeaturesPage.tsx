// src/pages/FeaturesPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Make sure this import is present
import { Button } from '@/components/ui/button'; // Assuming Button is used
import { Zap, Users, MessageSquare, Video, ShieldCheck, BarChart3, Settings2 } from 'lucide-react';

interface FeatureDetailProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const FeatureDetail: React.FC<FeatureDetailProps> = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center text-center"
    >
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};


const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Gestion de Projets Intuitive",
      description: "Organisez vos projets avec des tableaux Kanban flexibles, des listes de tâches claires et des suivis de progression en temps réel. Simplifiez la planification et l'exécution.",
      index: 0,
    },
    {
      icon: Users,
      title: "Collaboration d'Équipe Facilitée",
      description: "Travaillez ensemble efficacement grâce à des espaces de travail partagés, des attributions de tâches et des notifications instantanées. Centralisez la communication.",
      index: 1,
    },
    {
      icon: MessageSquare,
      title: "Messagerie d'Équipe Intégrée",
      description: "Communiquez rapidement avec vos collègues grâce à un chat par projet ou des messages directs. Partagez des fichiers et des idées sans quitter la plateforme.",
      index: 2,
    },
    {
      icon: Video,
      title: "Visioconférence Sécurisée",
      description: "Organisez des réunions virtuelles directement dans Piperchat. Partage d'écran, enregistrement et outils collaboratifs pour des échanges productifs.",
      index: 3,
    },
    {
      icon: Settings2,
      title: "Personnalisation Avancée",
      description: "Adaptez Piperchat à vos processus avec des champs personnalisés, des modèles de projet et des intégrations avec vos outils favoris. Une solution qui s'adapte à vous.",
      index: 4,
    },
     {
      icon: ShieldCheck,
      title: "Sécurité et Fiabilité",
      description: "Vos données sont protégées avec un cryptage de pointe, des sauvegardes régulières et une infrastructure robuste. Travaillez en toute confiance.",
      index: 5,
    }
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
          Fonctionnalités Clés de Piperchat
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez comment Piperchat peut transformer votre manière de travailler, de la gestion de tâches à la collaboration d'équipe, en passant par la communication.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature) => (
          <FeatureDetail
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={feature.index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: features.length * 0.1 + 0.3 }}
        className="mt-16 text-center"
      >
        <h2 className="text-3xl font-semibold text-foreground mb-6">Prêt à optimiser votre flux de travail ?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Rejoignez les milliers d'équipes qui font confiance à Piperchat pour gérer leurs projets et atteindre leurs objectifs plus rapidement.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Commencer gratuitement</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default FeaturesPage;