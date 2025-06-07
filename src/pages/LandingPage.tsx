// src/pages/LandingPage.tsx
import React from 'react';
import HeroSection from './LandingPage/components/HeroSection';
import FeaturesSection from './LandingPage/components/FeaturesSection';
import HowItWorksSection from './LandingPage/components/HowItWorksSection';
import CallToActionSection from './LandingPage/components/CallToActionSection';

const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CallToActionSection />
      {/* You can add more sections here later, e.g., Testimonials, Pricing */}
    </>
  );
};

export default LandingPage;
