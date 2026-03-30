'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, Zap } from 'lucide-react';
import { FloatingAIBrain } from './FloatingAIBrain';

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate text elements
      gsap.from([textRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power2.out',
      });

      // Parallax effect on scroll
      gsap.to([textRef.current, ctaRef.current], {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
        y: (i) => 100 + i * 20,
        opacity: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white"
    >
      {/* Background gradient waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[300px] bg-gradient-to-l from-cyan-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Text */}
        <motion.div
          ref={textRef}
          className="space-y-8 text-center lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <div className="px-3 py-1 bg-emerald-100/60 backdrop-blur-sm rounded-full border border-emerald-200/50">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> AI Powered
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            AI-Powered
            <br />
            Financial
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-600 max-w-md leading-relaxed">
            Predict markets. Analyze trends. Execute smarter. Get institutional-grade insights powered by advanced AI
            algorithms.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center lg:justify-start pt-4">
            <button
              ref={ctaRef}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3 border border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex gap-6 justify-center lg:justify-start pt-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Trusted by 50K+ traders
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Real-time analytics
            </div>
          </div>
        </motion.div>

        {/* Right side - Floating AI Brain */}
        <motion.div
          className="hidden lg:flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          <FloatingAIBrain />
        </motion.div>
      </div>
    </section>
  );
};
