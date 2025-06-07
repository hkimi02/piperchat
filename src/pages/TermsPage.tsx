// src/pages/TermsPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-8 md:p-12 rounded-lg shadow-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
          Conditions Générales d'Utilisation (Illustratives)
        </h1>
        <div className="prose prose-lg max-w-none text-card-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <div className="my-6 bg-accent/50 p-4 rounded-md text-accent-foreground text-base !leading-relaxed">
            <p className="!mt-0 font-semibold">
              Note Importante : Contexte du Projet d'Étude
            </p>
            <p className="!mt-2">
              Piperchat est un projet d'étude développé par Elyes Ghorbel, Amine Hkimi, et Yassine Aniba
              dans le cadre de leur formation à iTeam University.
            </p>
            <p className="!mt-2">
              Les présentes Conditions Générales d'Utilisation sont fournies à titre illustratif et pour les besoins
              de ce projet académique. Elles ne constituent pas des conditions contractuelles pour un service commercial réel.
            </p>
          </div>

          <h2>1. Acceptation des Conditions</h2>
          <p>
            En accédant et en utilisant le service Piperchat (ci-après dénommé le "Service"),
            vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (ci-après dénommées "CGU").
            Si vous n'acceptez pas l'ensemble de ces conditions, vous ne devez pas utiliser le Service.
          </p>

          <h2>2. Description du Service</h2>
          <p>
            Piperchat est une application de suivi de projets et de tâches en mode SaaS, conçue pour aider
            les organisations à gérer leur travail et à collaborer efficacement. Les fonctionnalités
            spécifiques peuvent évoluer avec le temps.
          </p>

          <h2>3. Inscription et Compte Utilisateur</h2>
          <p>
            Pour utiliser certaines fonctionnalités du Service, vous devez créer un compte. Vous êtes
            responsable de la confidentialité de vos informations de connexion et de toutes les activités
            qui se déroulent sous votre compte. Vous vous engagez à fournir des informations exactes et
            complètes lors de votre inscription.
          </p>

          <h2>4. Utilisation du Service</h2>
          <p>
            Vous vous engagez à utiliser le Service conformément aux lois applicables et aux présentes CGU.
            Il est interdit d'utiliser le Service à des fins illégales, frauduleuses, ou pour transmettre
            du contenu nuisible, offensant, ou qui viole les droits de tiers.
          </p>
          
          <h2>5. Propriété Intellectuelle</h2>
          <p>
            Le Service et tous les contenus et matériaux y afférents (logos, textes, graphiques, etc.),
            à l'exception du contenu généré par les utilisateurs, sont la propriété exclusive de Piperchat
            ou de ses concédants de licence et sont protégés par les lois sur la propriété intellectuelle.
          </p>

          <h2>6. Contenu Utilisateur</h2>
          <p>
            Vous conservez la propriété de tout contenu que vous soumettez, publiez ou affichez sur ou via
            le Service ("Contenu Utilisateur"). En soumettant du Contenu Utilisateur, vous accordez à Piperchat
            une licence mondiale, non exclusive, libre de droits, pour utiliser, copier, reproduire, traiter,
            adapter, modifier, publier, transmettre, afficher et distribuer ce Contenu Utilisateur dans le
            cadre de la fourniture du Service.
          </p>

          <h2>7. Limitation de Responsabilité</h2>
          <p>
            Dans toute la mesure permise par la loi applicable, Piperchat ne sera en aucun cas responsable
            des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de
            profits ou de revenus, qu'ils soient subis directement ou indirectement, ou de toute perte de
            données, d'utilisation, de clientèle ou d'autres pertes intangibles, résultant de (i) votre accès
            ou utilisation ou incapacité d'accéder ou d'utiliser le service ; (ii) toute conduite ou contenu
            d'un tiers sur le service.
          </p>

          <h2>8. Modification des CGU</h2>
          <p>
            Piperchat se réserve le droit de modifier ces CGU à tout moment. Nous vous informerons de toute
            modification substantielle. Votre utilisation continue du Service après de telles modifications
            constitue votre acceptation des nouvelles CGU.
          </p>

          <h2>9. Droit Applicable et Juridiction</h2>
          <p>
            Les présentes CGU sont régies et interprétées conformément au droit français. Tout litige relatif
            à ces CGU sera soumis à la compétence exclusive des tribunaux de Paris, France.
          </p>

          <h2>10. Contact</h2>
          <p>
            Pour toute question concernant ces CGU, veuillez nous contacter à l'adresse <a href="mailto:legal@piperchat.com">legal@piperchat.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
