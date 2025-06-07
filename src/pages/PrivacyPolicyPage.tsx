// src/pages/PrivacyPolicyPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-8 md:p-12 rounded-lg shadow-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
          Politique de Confidentialité (Illustrative)
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
              La présente Politique de Confidentialité est fournie à titre illustratif et pour les besoins
              de ce projet académique. Elle ne décrit pas les pratiques de traitement des données pour un service commercial réel.
            </p>
          </div>

          <h2>1. Introduction</h2>
          <p>
            Piperchat (ci-après dénommé "nous", "notre" ou "nos") s'engage à protéger la vie privée
            des utilisateurs (ci-après dénommés "vous" ou "votre") de notre service Piperchat (le "Service").
            Cette Politique de Confidentialité décrit comment nous collectons, utilisons, divulguons et
            protégeons vos informations personnelles.
          </p>

          <h2>2. Informations que nous collectons</h2>
          <p>Nous pouvons collecter les types d'informations suivants :</p>
          <ul>
            <li>
              <strong>Informations fournies par l'utilisateur :</strong> Lorsque vous créez un compte ou utilisez
              le Service, vous pouvez nous fournir des informations personnelles telles que votre nom,
              votre adresse e-mail, votre nom d'entreprise, et d'autres informations de profil.
            </li>
            <li>
              <strong>Données d'utilisation :</strong> Nous collectons des informations sur la manière dont vous
              utilisez le Service, telles que les fonctionnalités que vous utilisez, les actions que vous
              effectuez, et les heures d'accès.
            </li>
            <li>
              <strong>Informations sur l'appareil et la connexion :</strong> Nous pouvons collecter des informations
              sur l'appareil que vous utilisez pour accéder au Service, y compris l'adresse IP, le type de
              navigateur, le système d'exploitation, et les identifiants de l'appareil.
            </li>
            <li>
              <strong>Cookies et technologies similaires :</strong> Nous utilisons des cookies et d'autres
              technologies de suivi pour améliorer votre expérience utilisateur et analyser l'utilisation
              du Service.
            </li>
          </ul>

          <h2>3. Comment nous utilisons vos informations</h2>
          <p>Nous utilisons les informations collectées pour :</p>
          <ul>
            <li>Fournir, exploiter et améliorer le Service.</li>
            <li>Personnaliser votre expérience sur le Service.</li>
            <li>Communiquer avec vous, y compris pour le support client et les mises à jour du Service.</li>
            <li>Analyser l'utilisation du Service pour comprendre et améliorer nos offres.</li>
            <li>Assurer la sécurité et l'intégrité de notre Service.</li>
            <li>Respecter nos obligations légales.</li>
          </ul>

          <h2>4. Partage de vos informations</h2>
          <p>Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations avec :</p>
          <ul>
            <li>
              <strong>Fournisseurs de services tiers :</strong> Qui nous aident à exploiter le Service (par exemple,
              hébergement, analyse de données, traitement des paiements). Ces fournisseurs sont tenus de
              protéger vos informations.
            </li>
            <li>
              <strong>Autorités légales :</strong> Si la loi l'exige ou pour protéger nos droits, notre propriété
              ou notre sécurité, ou ceux d'autrui.
            </li>
            <li>
              <strong>Transferts d'entreprise :</strong> En cas de fusion, acquisition, ou vente de tout ou partie
              de nos actifs, vos informations peuvent être transférées.
            </li>
          </ul>
          
          <h2>5. Sécurité de vos informations</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour
            protéger vos informations personnelles contre l'accès non autorisé, la modification, la divulgation
            ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage
            électronique n'est sécurisée à 100 %.
          </p>

          <h2>6. Vos droits et choix</h2>
          <p>
            Selon votre juridiction, vous pouvez avoir certains droits concernant vos informations personnelles,
            tels que le droit d'accès, de rectification, de suppression, ou de limitation du traitement.
            Vous pouvez généralement gérer les informations de votre compte via les paramètres du Service.
          </p>

          <h2>7. Conservation des données</h2>
          <p>
            Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir le Service
            et remplir les objectifs décrits dans cette politique, ou tel que requis par la loi.
          </p>

          <h2>8. Modifications de cette Politique de Confidentialité</h2>
          <p>
            Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. Nous vous informerons
            de tout changement important en publiant la nouvelle politique sur cette page et, le cas échéant,
            par d'autres moyens.
          </p>

          <h2>9. Nous Contacter</h2>
          <p>
            Si vous avez des questions concernant cette Politique de Confidentialité ou nos pratiques en matière
            de données, veuillez nous contacter à <a href="mailto:privacy@piperchat.com">privacy@piperchat.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicyPage;
