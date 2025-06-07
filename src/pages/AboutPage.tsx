// src/pages/AboutPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-8 md:p-12 rounded-lg shadow-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
          À Propos de Piperchat
        </h1>
        <div className="max-w-3xl mx-auto space-y-6 text-lg text-card-foreground">
          <p>
            Bienvenue sur Piperchat ! Notre mission est de simplifier la gestion de projet et la collaboration
            pour les équipes de toutes tailles. Nous croyons qu'avec les bons outils, chaque équipe peut atteindre
            des sommets de productivité et d'efficacité.
          </p>
          <p>
            Piperchat a été conçu en pensant aux défis quotidiens rencontrés par les chefs de projet et
            les membres d'équipe. De la planification initiale à la livraison finale, notre plateforme
            offre une suite complète de fonctionnalités pour vous aider à rester organisé, à communiquer
            clairement et à atteindre vos objectifs.
          </p>
          
          <div className="pt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Notre Vision</h2>
            <p className="text-muted-foreground">
              Nous aspirons à devenir la solution de référence pour la collaboration d'équipe, en offrant
              une expérience utilisateur intuitive, des fonctionnalités puissantes et une flexibilité
              permettant de s'adapter à divers flux de travail.
            </p>
          </div>

          <div className="pt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">L'Équipe (Conceptuelle)</h2>
            <p className="text-muted-foreground">
              Derrière Piperchat se cache une équipe passionnée de développeurs, designers et experts en produits,
              dédiée à la création d'outils qui font une réelle différence. Nous sommes constamment à l'écoute
              de nos utilisateurs pour améliorer et faire évoluer notre plateforme.
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center sm:text-left">
              Note Importante : Contexte du Projet
            </h2>
            <div className="bg-accent/50 p-6 rounded-md text-accent-foreground text-base">
              <p className="font-semibold">
                Piperchat est un projet d'étude réalisé dans le cadre de notre formation à iTeam University.
              </p>
              <p className="mt-2">
                Il a été développé par :
              </p>
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Elyes Ghorbel</li>
                <li>Amine Hkimi</li>
                <li>Yassine Aniba</li>
              </ul>
              <p className="mt-3">
                Ce projet est à des fins de démonstration et d'apprentissage et ne constitue pas un produit commercial.
              </p>
            </div>
          </div>
          {/* Add more content as needed: history, values, team members, etc. */}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
