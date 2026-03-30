'use client';

import React, { useState, useEffect } from 'react';
import { MarketStrip, AssetCard, SectorPerformance } from '../../components/DashboardComponents';
import { useApp } from '../../context/AppContext';
import { Globe, Star, Zap, BarChart3, TrendingUp, TrendingDown, Activity, BrainCircuit } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { getCompanyLogoUrl } from '../../lib/logoMap';
import Link from 'next/link';
import { motion } from 'motion/react';

export const Dashboard = () => {
  const { watchlist, isPro } = useApp();

  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'stocks') {
          // Fetch stock data
          const symbols = ['AAPL', 'TSLA', 'NVDA', 'RELIANCE.NS', 'MSFT', 'GOOGL'];
          const response = await Promise.all(
            symbols.map(s => fetch(`/api/stocks/${s}`).then(res => res.json()).catch(() => null))
          );
          setTrending(response.filter(r => r && r.quote).map(r => r.quote));
        } else {
          // Fetch crypto data
          const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'polkadot'];
          const response = await Promise.all(
            cryptoIds.map(id => fetch(`/api/crypto/${id}`).then(res => res.json()).catch(() => null))
          );
          setTrending(response.filter(r => r).map(r => ({
            symbol: r.id.toUpperCase(),
            shortName: r.name,
            regularMarketPrice: r.market_data?.current_price?.usd || 0,
            regularMarketChangePercent: r.market_data?.price_change_percentage_24h || 0,
            currency: 'USD',
            quoteType: 'CRYPTOCURRENCY'
          })));
        }
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, [activeTab]);

  return (
    <>
      {/* Market Strip */}
      <MarketStrip />

      {/* Main Dashboard Content */}
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-600 font-medium">Track your portfolio and market trends in real-time</p>
        </motion.div>

        {/* Trending Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Trending Now</h2>
              <p className="text-sm text-slate-600 font-medium">Top movers across {activeTab}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('stocks')}
                className={cn(
                  'px-4 py-2 rounded-xl font-bold transition-all',
                  activeTab === 'stocks'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white/50 text-slate-600 hover:bg-white/70'
                )}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Stocks
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={cn(
                  'px-4 py-2 rounded-xl font-bold transition-all',
                  activeTab === 'crypto'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white/50 text-slate-600 hover:bg-white/70'
                )}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Crypto
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((asset, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sector Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sector Performance</h2>
          <SectorPerformance country="US" />
        </motion.div>

        {/* Watchlist Preview */}
        {watchlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Watchlist</h2>
              <Link
                href="/watchlist"
                className="text-primary font-bold hover:text-primary/80 transition-colors"
              >
                View All →
              </Link>
            </div>
            <p className="text-sm text-slate-600 font-medium">{watchlist.length} assets saved</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
