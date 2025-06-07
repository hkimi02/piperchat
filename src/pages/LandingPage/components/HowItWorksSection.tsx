// src/pages/LandingPage/components/HowItWorksSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FolderPlus, CheckSquare } from 'lucide-react'; // Example icons

interface StepItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const StepItem: React.FC<StepItemProps> = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="relative mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4 ring-4 ring-primary/20">
          <Icon className="w-8 h-8" />
        </div>
        {/* Dashed line connector for all but the last item */}
        {index < 2 && ( /* Assuming 3 steps, so index 0 and 1 get a line */
          <div className="hidden md:block absolute top-1/2 left-full w-16 h-px bg-border border-dashed border-t-2 border-muted-foreground/50 transform -translate-y-1/2 ml-4"></div>
        )}
         <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {index + 1}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Créez Votre Organisation',
      description: 'Inscrivez-vous et configurez votre espace de travail en quelques clics. Invitez ensuite vos collaborateurs.',
    },
    {
      icon: FolderPlus,
      title: 'Lancez Vos Projets',
      description: 'Définissez vos projets, ajoutez des tâches, et organisez-les avec nos outils flexibles (Kanban, listes).',
    },
    {
      icon: CheckSquare, // Changed from MessageSquare to better reflect task completion/collaboration
      title: 'Collaborez & Progressez',
      description: 'Communiquez, partagez des fichiers et suivez l\'avancement pour atteindre vos objectifs ensemble.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment <span className="text-primary">Piperchat</span> Fonctionne ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Un processus simple en trois étapes pour transformer votre gestion de projet.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
           {/* Decorative line for larger screens - might need more complex SVG for curves */}
           {/* <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-border transform -translate-y-1/2"></div> */}
          {steps.map((step, index) => (
            <StepItem key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
