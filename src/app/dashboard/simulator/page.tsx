'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AIScenarioSimulator } from '../../../components/AIScenarioSimulator';
import { motion } from 'motion/react';
import { BrainCircuit, Zap, TrendingUp, BarChart3 } from 'lucide-react';

export const Simulator = () => {
  const { isPro } = useApp();
  const [activeScenario, setActiveScenario] = useState<string>('bull_market');

  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 px-4 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50"
      >
        <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-lg text-slate-600 font-bold mb-2">AI Scenario Simulator</p>
        <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">
          This premium feature is available for Pro users. Upgrade your account to unlock advanced market simulations.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-black text-slate-900">AI Scenario Simulator</h1>
        </div>
        <p className="text-slate-600 font-medium">Test market strategies and simulate various scenarios with AI</p>
      </motion.div>

      {/* Scenario Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-900">Select Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'bull_market', name: 'Bull Market', icon: TrendingUp, color: 'emerald' },
            { id: 'bear_market', name: 'Bear Market', icon: TrendingUp, color: 'rose' },
            { id: 'correction', name: 'Market Correction', icon: BarChart3, color: 'amber' }
          ].map((scenario) => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario.id)}
                className={`p-4 rounded-2xl border transition-all font-bold text-lg flex items-center gap-3 ${
                  activeScenario === scenario.id
                    ? `bg-${scenario.color}-50 border-${scenario.color}-500 text-${scenario.color}-700 shadow-lg shadow-${scenario.color}-500/20`
                    : 'bg-white/50 border-white/50 text-slate-700 hover:border-white/80'
                }`}
              >
                <Icon className="w-6 h-6" />
                {scenario.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Simulator Component */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AIScenarioSimulator />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            title: 'Real-Time Analysis',
            description: 'AI analyzes market conditions across multiple sectors'
          },
          {
            title: 'Risk Assessment',
            description: 'Evaluate potential risks in different market scenarios'
          },
          {
            title: 'Strategy Testing',
            description: 'Test your portfolio against various market conditions'
          }
        ].map((info, i) => (
          <div key={i} className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50">
            <Zap className="w-6 h-6 text-primary mb-2" />
            <p className="font-bold text-slate-900 mb-1">{info.title}</p>
            <p className="text-sm text-slate-600 font-medium">{info.description}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Simulator;
