'use client';
import { useEffect } from 'react';
import { GlobalBackground } from '../components/GlobalBackground';
import { HeroSection } from '../components/HeroSection';
import { AIAnalytics } from '../components/AIAnalytics';
import { FeaturesSection } from '../components/FeaturesSection';
import { DarkTransition } from '../components/DarkTransition';
import { LoginPanel } from '../components/LoginPanel';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 30,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach((s) => s.kill());
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <GlobalBackground />
      <HeroSection />
      <AIAnalytics />
      <FeaturesSection />
      <DarkTransition />
      <LoginPanel />
    </main>
  );
}
