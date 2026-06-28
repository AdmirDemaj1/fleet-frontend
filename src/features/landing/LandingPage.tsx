import React from 'react';
import { Box } from '@mui/material';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { JourneyCarousel } from './JourneyCarousel';
import { FeaturesSection } from './components/FeaturesSection';
import { AiSection } from './components/AiSection';
import { PricingSection } from './components/PricingSection';
import { CtaBanner } from './components/CtaBanner';
import { LandingFooter } from './components/LandingFooter';
import { BG } from './constants/theme';

export const LandingPage: React.FC = () => (
  <Box sx={{ backgroundColor: BG, minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
    <LandingNavbar />
    <HeroSection />
    <StatsBar />
    <JourneyCarousel />
    <FeaturesSection />
    <AiSection />
    <PricingSection />
    <CtaBanner />
    <LandingFooter />
  </Box>
);
