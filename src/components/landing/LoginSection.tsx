'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LoginCard } from './LoginCard';

export const LoginSection: React.FC = () => {
  return (
    <div id="login" className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
      {/* Left: Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
            Start Trading with{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Confidence
            </span>
          </h2>

          <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            Join thousands of traders who trust Aura Intel for AI-powered market insights and intelligent trading decisions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary font-black">✓</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Real-time AI Analysis</p>
              <p className="text-sm text-slate-600">Market predictions updated every second</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary font-black">✓</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Smart Alerts</p>
              <p className="text-sm text-slate-600">Get notified about high-probability opportunities</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-primary font-black">✓</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Professional Tools</p>
              <p className="text-sm text-slate-600">Institutional-grade analysis at your fingertips</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right: Login Card */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <LoginCard />
      </motion.div>
    </div>
  );
};
