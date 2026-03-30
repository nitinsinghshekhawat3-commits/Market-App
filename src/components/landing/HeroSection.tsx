'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Brain, BarChart3, Zap } from 'lucide-react';
import gsap from 'gsap';

export const HeroSection: React.FC = () => {
  const brainRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for brain
      gsap.to(brainRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating animation for charts
      gsap.to(chartsRef.current, {
        y: 20,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
      {/* Left: Animated AI Visuals */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative h-96 flex items-center justify-center"
      >
        {/* AI Brain visualization */}
        <div
          ref={brainRef}
          className="relative w-64 h-64 flex items-center justify-center"
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-primary/40"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Inner ring */}
          <motion.div
            className="absolute inset-8 rounded-full border-2 border-primary/60"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Brain icon */}
          <div className="relative z-10 bg-gradient-to-br from-primary/20 to-primary/10 p-8 rounded-2xl">
            <Brain className="w-20 h-20 text-primary" />
          </div>

          {/* Floating chart elements */}
          <motion.div
            className="absolute top-10 right-20 bg-white/50 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg"
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <BarChart3 className="w-5 h-5 text-primary" />
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-20 bg-white/50 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg"
            animate={{
              y: [0, 10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          >
            <TrendingUp className="w-5 h-5 text-primary" />
          </motion.div>
        </div>

        {/* Chart visualization */}
        <div
          ref={chartsRef}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-40"
        >
          <motion.div
            className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent rounded-3xl border border-primary/20 backdrop-blur-sm p-6"
            animate={{
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.1)',
                '0 0 40px rgba(16, 185, 129, 0.2)',
                '0 0 20px rgba(16, 185, 129, 0.1)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="flex gap-2 h-full items-end">
              {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
                  style={{ height: `${height}%` }}
                  animate={{
                    scaleY: [0.8, 1, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right: Hero Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="space-y-8"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            AI-Powered Intelligence
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            Trade Smarter with{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
            Real-time market analysis, AI-powered predictions, and institutional-grade insights.
            Make confident investment decisions backed by advanced machine learning.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.a
            href="#login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-center shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Get Started Free
          </motion.a>

          <motion.a
            href="#features"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-900 rounded-2xl font-bold text-center border border-white/50 hover:bg-white/70 transition-all"
          >
            Learn More
          </motion.a>
        </div>

        <div className="flex items-center gap-8 pt-8 border-t border-white/20">
          <div>
            <p className="text-2xl font-black text-slate-900">100K+</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Traders</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">$5B+</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Assets Analyzed</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">94%</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Accuracy</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
