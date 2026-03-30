'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import { Star, Share2, TrendingUp, TrendingDown, Zap, ArrowUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '../../../../lib/utils';

interface CryptoDetail {
  id: string;
  name: string;
  symbol: string;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
  };
}

export const CryptoDetail = () => {
  const params = useParams();
  const id = (params.id as string)?.toLowerCase();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useApp();

  const [crypto, setCrypto] = useState<CryptoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/crypto/${id}`);
        const data = await response.json() as CryptoDetail;
        setCrypto(data);
        
        // Check if in watchlist
        const inWatchlist = watchlist.includes(data.symbol);
        setIsInWatchlist(inWatchlist);
      } catch (error) {
        console.error('Error fetching crypto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCrypto();
    }
  }, [id, watchlist]);

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(crypto?.symbol || id);
    } else {
      addToWatchlist(crypto?.symbol || id.toUpperCase());
    }
    setIsInWatchlist(!isInWatchlist);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Cryptocurrency not found</p>
        <Link href="/dashboard" className="text-primary font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const price = crypto.market_data.current_price.usd;
  const change = crypto.market_data.price_change_percentage_24h;
  const isPositive = change >= 0;

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
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900">{crypto.symbol}</h1>
              <span className="text-lg text-slate-600 font-medium">{crypto.name}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWatchlistToggle}
              className={cn(
                'p-3 rounded-xl transition-all font-bold',
                isInWatchlist
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              )}
            >
              <Star className={cn('w-5 h-5', isInWatchlist && 'fill-current')} />
            </button>
            <button className="p-3 rounded-xl bg-white/50 text-slate-600 hover:bg-white/70 transition-all font-bold">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price Info */}
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black text-slate-900">
            ${price.toLocaleString('en-US', { maximumFractionDigits: 8 })}
          </span>
          <div className={cn('flex items-center gap-1 pb-2 font-bold text-lg', isPositive ? 'text-emerald-600' : 'text-rose-600')}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {Math.abs(change).toFixed(2)}% (24h)
          </div>
        </div>
      </motion.div>

      {/* Key Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Market Cap',
            value: '$' + (crypto.market_data.market_cap.usd / 1000000000).toFixed(2) + 'B',
            icon: DollarSign
          },
          {
            label: '24h Volume',
            value: '$' + (crypto.market_data.total_volume.usd / 1000000).toFixed(1) + 'M',
            icon: TrendingUp
          },
          {
            label: '24h High',
            value: '$' + crypto.market_data.high_24h.usd.toFixed(2),
            icon: ArrowUp
          },
          {
            label: '24h Low',
            value: '$' + crypto.market_data.low_24h.usd.toFixed(2),
            icon: TrendingDown
          },
          {
            label: 'All-Time High',
            value: '$' + crypto.market_data.ath.usd.toFixed(2),
            icon: Zap
          },
          {
            label: 'All-Time Low',
            value: '$' + crypto.market_data.atl.usd.toFixed(2),
            icon: DollarSign
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <Icon className="w-8 h-8 text-primary/30" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Price Range */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-900">24h Range</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 font-medium">
            <span>${crypto.market_data.low_24h.usd.toFixed(2)}</span>
            <span>${crypto.market_data.high_24h.usd.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                isPositive ? 'bg-emerald-500' : 'bg-rose-500'
              )}
              style={{
                width: `${
                  ((price - crypto.market_data.low_24h.usd) /
                    (crypto.market_data.high_24h.usd - crypto.market_data.low_24h.usd)) *
                  100
                }%`
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CryptoDetail;
