'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import { Star, Share2, TrendingUp, TrendingDown, Globe, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '../../../../lib/utils';

interface StockDetail {
  quote: {
    symbol: string;
    shortName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketChangePercent: number;
    regularMarketChange: number;
    marketCap: number;
    averageVolume: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
    trailingPE: number;
    trailingAnnualDividendYield: number;
    epsTrailingTwelveMonths: number;
    beta: number;
    bookValue: number;
  };
  historicalData: any[];
}

export const StockDetail = () => {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase();
  const { watchlist, addToWatchlist, removeFromWatchlist, currency, fxRate } = useApp();

  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '1Y' | 'ALL'>('1M');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${symbol}`);
        const data = await response.json();
        setStock(data);
        
        // Check if in watchlist
        const inWatchlist = watchlist.includes(symbol);
        setIsInWatchlist(inWatchlist);
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStock();
    }
  }, [symbol, watchlist]);

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
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

  if (!stock) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Stock not found</p>
        <Link href="/dashboard" className="text-primary font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { quote } = stock;
  const isPositive = quote.regularMarketChangePercent >= 0;

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
              <h1 className="text-4xl font-black text-slate-900">{quote.symbol}</h1>
              <span className="text-lg text-slate-600 font-medium">{quote.shortName}</span>
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
            {formatCurrency(quote.regularMarketPrice, currency, fxRate)}
          </span>
          <div className={cn('flex items-center gap-1 pb-2 font-bold text-lg', isPositive ? 'text-emerald-600' : 'text-rose-600')}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {Math.abs(quote.regularMarketChangePercent).toFixed(2)}%
            <span className="text-sm ml-1">
              {isPositive ? '+' : ''}{formatCurrency(quote.regularMarketChange, currency, fxRate)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Price Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4 p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Price Information</h2>
          <div className="flex gap-2">
            {(['1D', '5D', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-3 py-1 rounded-lg font-bold text-sm transition-all',
                  timeframe === tf
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-white/50'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center py-12 text-slate-600 font-medium">
          Chart data loading...
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Market Cap', value: formatCurrency(quote.marketCap, currency, fxRate), icon: Zap },
          { label: 'Volume', value: (quote.averageVolume / 1000000).toFixed(1) + 'M', icon: TrendingUp },
          { label: 'P/E Ratio', value: quote.trailingPE?.toFixed(2) || 'N/A', icon: Globe },
          { label: 'Beta', value: quote.beta?.toFixed(2) || 'N/A', icon: ArrowUp }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
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
            </div>
          );
        })}
      </motion.div>

      {/* Additional Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: '52-Week High',
            value: formatCurrency(quote.fiftyTwoWeekHigh, currency, fxRate),
            subtext: `Low: ${formatCurrency(quote.fiftyTwoWeekLow, currency, fxRate)}`
          },
          {
            label: '50-Day Avg',
            value: formatCurrency(quote.fiftyDayAverage, currency, fxRate),
            subtext: `200-Day: ${formatCurrency(quote.twoHundredDayAverage, currency, fxRate)}`
          },
          {
            label: 'EPS',
            value: quote.epsTrailingTwelveMonths?.toFixed(2) || 'N/A',
            subtext: quote.trailingAnnualDividendYield ? `Yield: ${(quote.trailingAnnualDividendYield * 100).toFixed(2)}%` : 'No dividend'
          }
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50"
          >
            <p className="text-sm text-slate-600 font-medium">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              {stat.subtext}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default StockDetail;
