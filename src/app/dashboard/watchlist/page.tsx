'use client';

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';

export const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useApp();

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
        <h1 className="text-4xl font-black text-slate-900">Watchlist</h1>
        <p className="text-slate-600 font-medium">
          {watchlist.length} assets saved • Manage your favorite stocks and crypto
        </p>
      </motion.div>

      {/* Content */}
      {watchlist.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16 px-4 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50"
        >
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600 font-bold mb-2">No Assets in Watchlist</p>
          <p className="text-slate-500 font-medium mb-6">
            Start adding stocks and crypto to track them here
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Explore Markets
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {watchlist.map((symbol, index) => (
            <motion.div
              key={symbol}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-black text-primary text-lg">
                    {symbol.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      {symbol}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromWatchlist(symbol)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Watchlist;
