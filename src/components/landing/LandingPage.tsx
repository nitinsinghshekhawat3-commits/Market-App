'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedBackground } from './AnimatedBackground';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { LoginSection } from './LoginSection';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect on scroll
      gsap.to('[data-parallax]', {
        y: (index, target) => {
          return parseFloat(target.dataset.parallax || '0') * window.innerHeight;
        },
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 1,
          start: 'top top',
          end: 'bottom bottom',
        },
      });

      // Fade in sections on scroll
      gsap.utils.toArray<HTMLElement>('[data-fade-in]').forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        });
      });

      // Background color change on scroll
      gsap.to('[data-bg]', {
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-white overflow-hidden">
      {/* Navigation */}
      <LandingNav />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Hero Section */}
      <section
        data-bg
        className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-8 pt-32 bg-gradient-to-b from-white via-green-50/20 to-white"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <HeroSection />
      </section>

      {/* Features Section */}
      <section
        data-fade-in
        className="relative w-full py-24 px-4 sm:px-8 bg-gradient-to-b from-white to-green-50/10"
      >
        <div className="max-w-7xl mx-auto">
          <FeaturesSection />
        </div>
      </section>

      {/* Login Section */}
      <section
        data-fade-in
        className="relative w-full min-h-screen flex items-center justify-center py-24 px-4 sm:px-8 bg-gradient-to-b from-green-50/10 to-white"
      >
        <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <LoginSection />
      </section>

      {/* Footer */}
      <footer className="relative w-full py-12 px-4 sm:px-8 border-t border-white/20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-lg">AI</span>
              </div>
              <span className="text-lg font-bold text-text-rich">
                Aura <span className="text-primary">Intel</span>
              </span>
            </div>

            <div className="flex gap-8 text-sm text-slate-600 font-medium">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            <p className="text-xs text-slate-500">© 2026 Aura Intel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
