'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Brain, BarChart3, Zap, TrendingUp, Shield, Bell } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Market Prediction',
    description: 'Advanced AI models predict market movements with 94% accuracy',
    color: 'from-primary to-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live market data, technical analysis, and institutional insights',
    color: 'from-blue-500 to-primary',
  },
  {
    icon: Zap,
    title: 'Smart Money Detection',
    description: 'Identify where institutional investors are moving their capital',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Analyze market trends across stocks, crypto, and commodities',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'AI-powered risk assessment and portfolio optimization',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when AI detects high-probability opportunities',
    color: 'from-green-500 to-emerald-500',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <div className="space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-center space-y-6 max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Powered by Advanced AI
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          Institutional-grade analysis meets cutting-edge artificial intelligence. Trade with confidence
          powered by machine learning models trained on millions of data points.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)' }}
              className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/50 cursor-pointer transition-all hover:border-primary/50"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 rounded-3xl transition-all duration-300" />

              {/* Icon */}
              <div className={`relative mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="relative text-sm text-slate-600 font-medium leading-relaxed">{feature.description}</p>

              {/* Border animation */}
              <div className="absolute inset-0 rounded-3xl border border-primary/0 group-hover:border-primary/30 transition-all duration-300" />
            </motion.div>
          );
        })}
      </div>

      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-20 border-t border-white/20"
      >
        {[
          { label: 'AI Confidence', value: '94%' },
          { label: 'Win Rate', value: '73%' },
          { label: 'Avg Return', value: '24% APY' },
          { label: 'Risk Score', value: 'Low' },
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2">
            <motion.p
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent"
            >
              {stat.value}
            </motion.p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
