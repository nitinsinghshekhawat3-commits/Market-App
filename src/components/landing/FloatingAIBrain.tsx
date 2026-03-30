'use client';

import React from 'react';
import { motion } from 'motion/react';

export const FloatingAIBrain = () => {
  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-emerald-200/30 shadow-lg shadow-emerald-500/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border border-cyan-200/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Brain SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-64 h-64 relative z-10"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Brain outline - simplified */}
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Brain shape */}
        <path
          d="M 100 30 Q 120 40 120 60 Q 120 75 110 85 L 130 95 Q 145 90 150 70 Q 155 50 140 40 Q 125 30 100 30"
          fill="url(#brainGradient)"
          filter="url(#glow)"
          opacity="0.8"
        />
        <path
          d="M 100 30 Q 80 40 80 60 Q 80 75 90 85 L 70 95 Q 55 90 50 70 Q 45 50 60 40 Q 75 30 100 30"
          fill="url(#brainGradient)"
          filter="url(#glow)"
          opacity="0.8"
        />

        {/* Main brain body */}
        <ellipse cx="100" cy="110" rx="50" ry="55" fill="url(#brainGradient)" filter="url(#glow)" opacity="0.7" />

        {/* Brain lobes */}
        <circle cx="75" cy="100" r="18" fill="url(#brainGradient)" filter="url(#glow)" opacity="0.6" />
        <circle cx="125" cy="100" r="18" fill="url(#brainGradient)" filter="url(#glow)" opacity="0.6" />
        <circle cx="90" cy="130" r="16" fill="url(#brainGradient)" filter="url(#glow)" opacity="0.5" />
        <circle cx="110" cy="130" r="16" fill="url(#brainGradient)" filter="url(#glow)" opacity="0.5" />

        {/* Center glow circle */}
        <circle cx="100" cy="110" r="20" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
        <motion.circle
          cx="100"
          cy="110"
          r="15"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="1.5"
          opacity="0.6"
          animate={{ r: [12, 22, 12] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          filter="url(#glow)"
        />
      </motion.svg>

      {/* Floating particles around brain */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400/60 rounded-full"
          animate={{
            x: Math.cos((i / 6) * Math.PI * 2) * 120,
            y: Math.sin((i / 6) * Math.PI * 2) * 120,
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-4px',
            marginTop: '-4px',
          }}
        />
      ))}

      {/* Background gradient orb */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 blur-3xl" />
    </div>
  );
};
