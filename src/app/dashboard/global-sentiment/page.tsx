'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, TrendingUp, TrendingDown, Activity, Zap, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface GlobalMarket {
  market: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  change: number;
  region: string;
}

export const GlobalSentiment = () => {
  const [markets, setMarkets] = useState<GlobalMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        
        // Mock global sentiment data
        setMarkets([
          {
            market: 'US Stock Market',
            sentiment: 'bullish',
            score: 72,
            change: 2.5,
            region: 'americas'
          },
          {
            market: 'European Markets',
            sentiment: 'bearish',
            score: 38,
            change: -3.2,
            region: 'europe'
          },
          {
            market: 'Asian Markets',
            sentiment: 'neutral',
            score: 51,
            change: 0.8,
            region: 'asia'
          },
          {
            market: 'Cryptocurrency',
            sentiment: 'bullish',
            score: 68,
            change: 5.1,
            region: 'global'
          },
          {
            market: 'Commodities',
            sentiment: 'bearish',
            score: 42,
            change: -2.3,
            region: 'global'
          },
          {
            market: 'Forex',
            sentiment: 'neutral',
            score: 55,
            change: 1.2,
            region: 'global'
          }
        ]);
      } catch (error) {
        console.error('Error fetching sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  const regions = ['all', 'americas', 'europe', 'asia', 'global'];
  const filteredMarkets = selectedRegion === 'all' 
    ? markets 
    : markets.filter(m => m.region === selectedRegion);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-500' };
      case 'bearish': return { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', badge: 'bg-rose-500' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-500', text: 'text-slate-700', badge: 'bg-slate-500' };
    }
  };

  const overallScore = markets.length > 0 
    ? Math.round(markets.reduce((sum, m) => sum + m.score, 0) / markets.length)
    : 0;

  const overallSentiment = overallScore > 60 ? 'bullish' : overallScore > 40 ? 'neutral' : 'bearish';
  const overallColor = getSentimentColor(overallSentiment);

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
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-black text-slate-900">Global Sentiment</h1>
        </div>
        <p className="text-slate-600 font-medium">Analyze overall market sentiment across regions</p>
      </motion.div>

      {/* Overall Market Sentiment */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`p-8 rounded-3xl border-2 ${overallColor.bg} ${overallColor.border}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-bold uppercase tracking-wider mb-2">Overall Market Sentiment</p>
            <p className={`text-5xl font-black mb-2 ${overallColor.text}`}>
              {overallSentiment.toUpperCase()}
            </p>
            <p className="text-lg font-bold text-slate-700">
              Sentiment Score: <span className={overallColor.text}>{overallScore}/100</span>
            </p>
          </div>
          <Activity className={`w-16 h-16 ${overallColor.text} opacity-50`} />
        </div>
      </motion.div>

      {/* Region Filter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-900">Filter by Region</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
            >
              {region.charAt(0).toUpperCase() + region.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredMarkets.map((market, index) => {
            const colors = getSentimentColor(market.sentiment);
            const Icon = market.sentiment === 'bullish' ? TrendingUp : market.sentiment === 'bearish' ? TrendingDown : BarChart3;

            return (
              <motion.div
                key={market.market}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`font-bold text-lg ${colors.text}`}>{market.market}</h3>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                <div className="space-y-3">
                  {/* Sentiment Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${colors.badge}`}>
                      {market.sentiment.toUpperCase()}
                    </span>
                    <span className={`font-bold ${market.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {market.change >= 0 ? '+' : ''}{market.change.toFixed(1)}%
                    </span>
                  </div>

                  {/* Score Bar */}
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                      <span>Score</span>
                      <span className={colors.text}>{market.score}/100</span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.badge} transition-all`}
                        style={{ width: `${market.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Insights Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Market Insights</h2>
        </div>

        <ul className="space-y-3">
          {[
            'US markets show strong bullish sentiment with positive momentum',
            'Asian markets trading near neutral with mixed signals',
            'Cryptocurrency markets displaying strong bullish bias',
            'European markets cautious following recent economic data'
          ].map((insight, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default GlobalSentiment;
