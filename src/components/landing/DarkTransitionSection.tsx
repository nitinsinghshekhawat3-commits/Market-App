'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const DarkTransitionSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect with multiple animations
      gsap.fromTo(
        chartContainerRef.current,
        {
          opacity: 0.3,
          y: 50,
        },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
            markers: false,
          },
          opacity: 1,
          y: -50,
          duration: 1,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Professional Trading Experience</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Advanced tools and real-time insights for professional traders and institutions
          </p>
        </motion.div>

        {/* Chart visualization */}
        <motion.div
          ref={chartContainerRef}
          className="relative group"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Glassmorphism container */}
          <div className="relative p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Trading Dashboard</h3>
                  <p className="text-2xl font-black text-white">Real-Time Market Data</p>
                </div>
                <motion.div
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-xs font-bold text-white">LIVE</span>
                </motion.div>
              </div>

              {/* Fake trading table */}
              <div className="space-y-3 text-sm">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white">{'AAPL,TSLA,GOOGL,MSFT'.split(',')[i]}</div>
                      <div className="text-xs text-slate-400">Stock · Holdings: $250K</div>
                    </div>
                    <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <div className="font-black text-emerald-400">+{2 + i}%</div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Chart area */}
              <div className="h-48 bg-gradient-to-b from-white/10 to-white/5 rounded-lg flex items-end justify-around p-4 gap-1">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-sm flex-1"
                    animate={{ scaleY: Math.random() * 0.8 + 0.2 }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      delay: i * 0.05,
                    }}
                    style={{ transformOrigin: 'bottom' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
