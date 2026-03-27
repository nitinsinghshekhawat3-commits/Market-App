import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Zap, Filter, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchSmartMoneyActivity, SmartMoneySignal } from '../services/smartMoneyService';

export const SmartMoneyTracker: React.FC = () => {
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

  // Get color based on signal sentiment
  const getSignalColor = (signal: string): string => {
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

  // Get icon color based on signal
  const getIconColor = (signal: string): string => {
    switch (signal) {
      case 'bullish':
        return 'bg-emerald-100 text-emerald-600';
      case 'bearish':
        return 'bg-red-100 text-red-600';
      case 'neutral':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // Get badge color based on signal
  const getSignalBadge = (signal: string): string => {
    switch (signal) {
      case 'bullish':
        return 'bg-emerald-100 text-emerald-700';
      case 'bearish':
        return 'bg-red-100 text-red-700';
      case 'neutral':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get confidence badge styling
  const getConfidenceBadge = (confidence: string): string => {
    switch (confidence) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
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
    <div className="space-y-6">
      {/* Header with LIVE indicator and control buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="w-7 h-7 text-amber-400" />
              Smart Money Tracker
            </h3>
            {!loading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                  Last checked: {lastCheckedTime ? (() => {
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
          <p className="text-sm text-slate-500">Manually check for whale transactions, volume spikes & momentum signals</p>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => loadSignals()}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap',
              loading
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            {loading ? 'Checking...' : 'Check Now'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-3 rounded-2xl bg-white/60 border border-white/80 hover:bg-white/80 transition-all active:scale-95"
          >
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Filter buttons */}
      {showFilters && (
        <div className="flex gap-2 p-3 bg-white/40 rounded-2xl border border-white/60">
          {(['all', 'crypto', 'stocks'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                // Auto-load when filter is changed
                setTimeout(() => loadSignals(), 100);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                filter === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              )}
            >
              {cat === 'all' ? 'All Markets' : cat === 'crypto' ? 'Crypto Only' : 'Stocks Only'}
            </button>
          ))}
        </div>
      )}

      {/* Signal Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">Market Quiet</p>
            <p className="text-slate-500 text-sm mt-1">Monitoring Smart Money...</p>
            <p className="text-slate-400 text-xs mt-3">Last signal detected: {getLastSignalText()}</p>
          </div>
        ) : (
          signals.map((signal, index) => (
            <div
              key={signal.id}
              className={cn(
                'relative border-2 rounded-2xl p-5 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-200',
                getSignalColor(signal.signal),
                signal.isNew && 'animate-pulse'
              )}
            >
              {/* Pulse animation border for new signals */}
              {signal.isNew && (
                <div className={cn('absolute inset-0 rounded-2xl border-2 animate-pulse pointer-events-none', getPulseBorderColor(signal.signal))} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'p-3 rounded-xl transition-all group-hover:scale-110 flex-shrink-0',
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
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 text-lg">{signal.assetName}</h4>
                    <span className={cn('text-xs font-bold px-3 py-1 rounded-full', getSignalBadge(signal.signal))}>
                      {signal.signal.toUpperCase()}
                    </span>
                    <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', getConfidenceBadge(signal.confidence))}>
                      {signal.confidence.toUpperCase()} confidence
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    {getSignalTypeLabel(signal.signalType)}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="font-bold text-slate-900">
                      {formatAmount(signal.amount, signal.currency)}
                    </div>
                    {signal.percentage !== undefined && (
                      <div
                        className={cn(
                          'font-bold',
                          signal.percentage > 0 ? 'text-emerald-600' : signal.percentage < 0 ? 'text-red-600' : 'text-slate-600'
                        )}
                      >
                        {signal.percentage > 0 ? '+' : ''}{signal.percentage.toFixed(2)}%
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500 ml-auto">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{formatTime(signal.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual check indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full" />
        Click "Check Now" to fetch the latest signals and save API quota
      </div>
    </div>
  );
};
