'use client';

import React, { useState } from 'react';
import { SectorPerformance } from '../../../components/DashboardComponents';
import { motion } from 'motion/react';
import { Globe, TrendingUp, BarChart3, Activity } from 'lucide-react';

export const Explore = () => {
  const [selectedCountry, setSelectedCountry] = useState<'US' | 'IN'>('US');
  const [searchQuery, setSearchQuery] = useState('');

  const countries = [
    { code: 'US', name: 'United States', icon: Globe },
    { code: 'IN', name: 'India', icon: Globe },
  ];

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
        <h1 className="text-4xl font-black text-slate-900">Explore Markets</h1>
        <p className="text-slate-600 font-medium">Discover stocks, crypto, and market trends</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stocks, crypto, or markets..."
          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/50 focus:border-primary focus:outline-none font-medium text-slate-900 placeholder-slate-500"
        />
      </motion.div>

      {/* Country Selection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-900">Select Market</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countries.map((country) => {
            const Icon = country.icon;
            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code as 'US' | 'IN')}
                className={`p-4 rounded-2xl border transition-all font-bold text-lg flex items-center gap-3 ${
                  selectedCountry === country.code
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20'
                    : 'bg-white/50 border-white/50 text-slate-700 hover:border-white/80'
                }`}
              >
                <Icon className="w-6 h-6" />
                {country.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Sector Performance */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900">Sector Performance</h2>
        <SectorPerformance country={selectedCountry} />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: BarChart3, label: 'Active Stocks', value: selectedCountry === 'US' ? '5,000+' : '2,000+' },
          { icon: Activity, label: 'Cryptocurrencies', value: '500+' },
          { icon: TrendingUp, label: 'Market Cap', value: selectedCountry === 'US' ? '$90T' : '$8T' },
          { icon: Globe, label: '24h Volume', value: selectedCountry === 'US' ? '$400B' : '$50B' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 text-center"
            >
              <Icon className="w-8 h-8 text-primary/30 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Explore;
