import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Zap, Filter, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { fetchSmartMoneyActivity, SmartMoneySignal } from '../services/smartMoneyService';

export const SmartMoneyTracker: React.FC = () => {
  const { theme } = useApp();
  const [signals, setSignals] = useState<SmartMoneySignal[]>([]);
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'crypto' | 'stocks' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch smart money signals
  const loadSignals = async () => {
    setLoading(true);
    const data = await fetchSmartMoneyActivity(filter);
    setSignals(data);
    setLastCheckedTime(new Date());
    if (data.length > 0) {
      setLastSignalTime(data[0].timestamp);
    }
    setLoading(false);
  };

  // Remove auto-refresh - only load on manual click
  useEffect(() => {
    // Load once on component mount
    loadSignals();
    // Cleanup
    return () => {};
  }, []);

  // Get color based on signal sentiment - theme aware
  const getSignalColor = (signal: string): string => {
    if (theme === 'dark') {
      switch (signal) {
        case 'bullish':
          return 'border-emerald-800 bg-emerald-950/35 hover:bg-emerald-950/50 hover:border-emerald-700';
        case 'bearish':
          return 'border-red-800 bg-red-950/35 hover:bg-red-950/50 hover:border-red-700';
        case 'neutral':
          return 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600';
        default:
          return 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600';
      }
    }
    switch (signal) {
      case 'bullish':
        return 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50';
      case 'bearish':
        return 'border-red-200 bg-red-50/50 hover:bg-red-50';
      case 'neutral':
        return 'border-amber-200 bg-amber-50/50 hover:bg-amber-50';
      default:
        return 'border-slate-200 bg-slate-50/50';
    }
  };

  // Get icon color based on signal - theme aware
  const getIconColor = (signal: string): string => {
    if (theme === 'dark') {
      switch (signal) {
        case 'bullish':
          return 'bg-emerald-900/50 text-emerald-300 shadow-lg shadow-emerald-900/30';
        case 'bearish':
          return 'bg-red-900/50 text-red-300 shadow-lg shadow-red-900/30';
        case 'neutral':
          return 'bg-amber-900/50 text-amber-300 shadow-lg shadow-amber-900/30';
        default:
          return 'bg-slate-700/50 text-slate-300';
      }
    }
    switch (signal) {
      case 'bullish':
        return 'bg-emerald-100 text-emerald-700 shadow-md shadow-emerald-200/50';
      case 'bearish':
        return 'bg-red-100 text-red-700 shadow-md shadow-red-200/50';
      case 'neutral':
        return 'bg-amber-100 text-amber-700 shadow-md shadow-amber-200/50';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // Get badge color based on signal - theme aware
  const getSignalBadge = (signal: string): string => {
    if (theme === 'dark') {
      switch (signal) {
        case 'bullish':
          return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 shadow-lg shadow-emerald-900/20';
        case 'bearish':
          return 'bg-red-900/40 text-red-300 border border-red-700/50 shadow-lg shadow-red-900/20';
        case 'neutral':
          return 'bg-amber-900/40 text-amber-300 border border-amber-700/50 shadow-lg shadow-amber-900/20';
        default:
          return 'bg-slate-700/40 text-slate-300';
      }
    }
    switch (signal) {
      case 'bullish':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-md shadow-emerald-200/60';
      case 'bearish':
        return 'bg-red-100 text-red-700 border border-red-200 shadow-md shadow-red-200/60';
      case 'neutral':
        return 'bg-amber-100 text-amber-700 border border-amber-200 shadow-md shadow-amber-200/60';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get confidence badge styling - theme aware
  const getConfidenceBadge = (confidence: string): string => {
    if (theme === 'dark') {
      switch (confidence) {
        case 'high':
          return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 shadow-lg shadow-emerald-900/20';
        case 'medium':
          return 'bg-blue-900/40 text-blue-300 border border-blue-700/50 shadow-lg shadow-blue-900/20';
        case 'low':
          return 'bg-slate-700/40 text-slate-300 border border-slate-600/50';
        default:
          return 'bg-slate-700/40 text-slate-300';
      }
    }
    switch (confidence) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-md shadow-emerald-200/60';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border border-blue-200 shadow-md shadow-blue-200/60';
      case 'low':
        return 'bg-slate-100 text-slate-700 border border-slate-200 shadow-md shadow-slate-200/40';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get pulse border color based on signal
  const getPulseBorderColor = (signal: string): string => {
    switch (signal) {
      case 'bullish':
        return 'border-emerald-400';
      case 'bearish':
        return 'border-red-400';
      case 'neutral':
        return 'border-amber-400';
      default:
        return 'border-slate-400';
    }
  };

  // Get signal type label
  const getSignalTypeLabel = (signalType: string): string => {
    switch (signalType) {
      case 'whale_accumulation':
        return '🐋 Whale Accumulation';
      case 'unusual_volume':
        return '⚡ Unusual Volume';
      case 'strong_buying':
        return '📈 Strong Buying';
      case 'strong_selling':
        return '📉 Strong Selling';
      case 'momentum_breakout':
        return '🚀 Momentum Breakout';
      default:
        return signalType;
    }
  };

  // Format amount for display
  const formatAmount = (amount: number, currency: string): string => {
    if (currency === 'USD') {
      if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
      if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
      if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
      return `$${amount.toFixed(2)}`;
    }
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`;
    return amount.toFixed(0);
  };

  // Format time ago
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Calculate time since last signal
  const getLastSignalText = (): string => {
    if (!lastSignalTime) return 'Never';
    const diff = Date.now() - lastSignalTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    return `${minutes}m ago`;
  };

  return (
    <div className={cn('space-y-6', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
      {/* Header with LIVE indicator and control buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn('text-2xl font-bold flex items-center gap-3', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              <Zap className={cn('w-7 h-7', theme === 'dark' ? 'text-amber-300' : 'text-amber-400')} />
              Smart Money Tracker
            </h3>
            {!loading && (
              <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border', theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-blue-50/60 border-blue-200/50')}>
                <div className={cn('w-2 h-2 rounded-full animate-pulse', theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500')} />
                <span className={cn('text-xs font-bold uppercase tracking-tight', theme === 'dark' ? 'text-slate-200' : 'text-slate-700')}>
                  {lastCheckedTime ? (() => {
                    const diff = Date.now() - lastCheckedTime.getTime();
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    if (minutes === 0) return `${seconds}s ago`;
                    return `${minutes}m ${seconds}s ago`;
                  })() : 'never'}
                </span>
              </div>
            )}
          </div>
          <p className={cn('text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>Manually check for whale transactions, volume spikes & momentum signals</p>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => loadSignals()}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap',
              loading
                ? theme === 'dark'
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            {loading ? 'Checking...' : 'Check Now'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-3 rounded-2xl transition-all active:scale-95',
              theme === 'dark'
                ? 'bg-slate-700 border border-slate-500 hover:bg-slate-600'
                : 'bg-white/60 border border-white/80 hover:bg-white/80'
            )}
          >
            <Filter className={cn('w-5 h-5', theme === 'dark' ? 'text-slate-200' : 'text-slate-600')} />
          </button>
        </div>
      </div>

      {/* Filter buttons */}
      {showFilters && (
        <div className={cn('flex gap-2 p-4 rounded-2xl border backdrop-blur-sm', theme === 'dark' ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/40 border-white/60')}>
          {(['all', 'crypto', 'stocks'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                // Auto-load when filter is changed
                setTimeout(() => loadSignals(), 100);
              }}
              className={cn(
                'px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200',
                filter === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : theme === 'dark'
                  ? 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
                  : 'bg-white/60 text-slate-600 hover:bg-white/90'
              )}
            >
              {cat === 'all' ? 'All Markets' : cat === 'crypto' ? 'Crypto Only' : 'Stocks Only'}
            </button>
          ))}
        </div>
      )}

      {/* Signal Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("h-28 animate-pulse rounded-2xl", theme === 'dark' ? 'bg-slate-700/25' : 'bg-slate-100')} />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className={cn("p-12 text-center border-2 border-dashed rounded-3xl backdrop-blur-sm", theme === 'dark' ? 'border-slate-700/40 bg-slate-800/20' : 'border-slate-200 bg-white/50')}>
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100')}>
              <Zap className={cn("w-8 h-8", theme === 'dark' ? 'text-slate-500' : 'text-slate-300')} />
            </div>
            <p className={cn("font-semibold text-lg", theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Market Quiet</p>
            <p className={cn("text-sm mt-1", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>Monitoring Smart Money...</p>
            <p className={cn("text-xs mt-3", theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>Last signal detected: {getLastSignalText()}</p>
          </div>
        ) : (
          signals.map((signal, index) => (
            <div
              key={signal.id}
              className={cn(
                'relative border-2 rounded-2xl p-6 transition-all duration-300 group backdrop-blur-sm',
                getSignalColor(signal.signal),
                theme === 'dark' ? 'hover:shadow-2xl hover:shadow-slate-900/40' : 'hover:shadow-xl hover:shadow-slate-300/30',
                signal.isNew && 'animate-pulse'
              )}
            >
              {/* Pulse animation border for new signals */}
              {signal.isNew && (
                <div className={cn('absolute inset-0 rounded-2xl border-2 animate-pulse pointer-events-none', getPulseBorderColor(signal.signal))} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              )}

              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className={cn(
                    'p-3 rounded-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0',
                    getIconColor(signal.signal)
                  )}
                >
                  {signal.signal === 'bullish' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : signal.signal === 'bearish' ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className={cn("font-bold text-lg tracking-tight", theme === 'dark' ? 'text-slate-50' : 'text-slate-950')}>{signal.assetName}</h4>
                    <span className={cn('text-xs font-bold px-3 py-1.5 rounded-lg', getSignalBadge(signal.signal))}>
                      {signal.signal.toUpperCase()}
                    </span>
                    <span className={cn('text-xs font-bold px-3 py-1.5 rounded-lg', getConfidenceBadge(signal.confidence))}>
                      {signal.confidence.toUpperCase()}
                    </span>
                  </div>

                  <p className={cn("text-sm font-medium mb-4 tracking-tight", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    {getSignalTypeLabel(signal.signalType)}
                  </p>

                  <div className={cn("flex flex-wrap items-center gap-5 text-sm font-semibold", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    <div className={cn("font-bold text-lg", theme === 'dark' ? 'text-slate-50' : 'text-slate-950')}>
                      {formatAmount(signal.amount, signal.currency)}
                    </div>
                    {signal.percentage !== undefined && (
                      <div
                        className={cn(
                          'font-bold px-3 py-1 rounded-lg',
                          signal.percentage > 0 ? theme === 'dark' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700' : signal.percentage < 0 ? theme === 'dark' ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700' : theme === 'dark' ? 'bg-slate-700/40 text-slate-300' : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {signal.percentage > 0 ? '+' : ''}{signal.percentage.toFixed(2)}%
                      </div>
                    )}
                    <div className={cn("flex items-center gap-1.5 ml-auto text-xs font-medium", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(signal.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual check indicator */}
      <div className={cn("flex items-center justify-center gap-2 text-xs font-medium pt-2", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
        <div className={cn("w-1.5 h-1.5 rounded-full", theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400')} />
        <span>Click "Check Now" to fetch the latest signals and save API quota</span>
      </div>
    </div>
  );
};
