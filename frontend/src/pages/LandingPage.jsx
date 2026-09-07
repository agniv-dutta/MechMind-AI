import React from 'react';
import Navigation from '../components/landing/Navigation.jsx';
import HeroSection from '../components/landing/HeroSection.jsx';
import { FeaturesSection, Testimonial, PricingSection, CTAFooter } from '../components/landing/MarketingSections.jsx';

export function LandingPage({ onEnter }) {
  return (
    <div className="bg-slate-950 min-h-screen overflow-y-auto">
      <Navigation onLogin={onEnter} onTrial={onEnter} />
      <HeroSection onTrial={onEnter} onDemo={onEnter} />
      <FeaturesSection />
      <Testimonial />
      <PricingSection onTrial={onEnter} />
      <CTAFooter onTrial={onEnter} />
    </div>
  );
}

export default LandingPage;
