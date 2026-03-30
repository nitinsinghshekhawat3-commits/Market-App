'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { HeroSection } from '../../components/landing/HeroSection';
import { AIAnalyticsSection } from '../../components/landing/AIAnalyticsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { DarkTransitionSection } from '../../components/landing/DarkTransitionSection';
import { LoginSection } from '../../components/landing/LoginSection';
import { BackgroundAnimation } from '../../components/landing/BackgroundAnimation';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Setup scroll animations
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        markers: false,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-white">
      {/* Background animation layer */}
      <BackgroundAnimation />

      {/* Sections */}
      <HeroSection />
      <AIAnalyticsSection />
      <FeaturesSection />
      <DarkTransitionSection />
      <LoginSection />
    </div>
  );
}
