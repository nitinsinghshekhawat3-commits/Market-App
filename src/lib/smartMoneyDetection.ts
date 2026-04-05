/**
 * Smart Money Detection Utilities
 * Helper functions for detecting whale transactions, volume spikes, and institutional flows
 */

export interface VolumeAnalysis {
  currentVolume: number;
  averageVolume: number;
  ratio: number;
  isSpike: boolean;
  percentage: number;
}

export interface PriceAnalysis {
  currentPrice: number;
  change: number;
  percentageChange: number;
  isSignificant: boolean;
}

/**
 * Analyze volume spike
 * Returns true if current volume is > 2x average volume
 */
export function analyzeVolumeSpike(
  currentVolume: number,
  averageVolume: number,
  threshold: number = 2
): VolumeAnalysis {
  const ratio = averageVolume > 0 ? currentVolume / averageVolume : 0;
  const percentage = ((currentVolume - averageVolume) / averageVolume) * 100;

  return {
    currentVolume,
    averageVolume,
    ratio,
    isSpike: ratio > threshold,
    percentage
  };
}

/**
 * Analyze crypto transaction size
 * Returns true if transaction value is > $1M
 */
export function analyzeWhaleTransaction(usdValue: number, threshold: number = 1000000): boolean {
  return usdValue > threshold;
}

/**
 * Determine signal sentiment based on price movement
 */
export function determineSentiment(
  priceChange: number,
  bullishThreshold: number = 1,
  bearishThreshold: number = -1
): 'bullish' | 'bearish' | 'neutral' {
  if (priceChange > bullishThreshold) return 'bullish';
  if (priceChange < bearishThreshold) return 'bearish';
  return 'neutral';
}

/**
 * Combine volume and price analysis for institutional flow detection
 */
export function detectInstitutionalActivity(
  volume: VolumeAnalysis,
  price: PriceAnalysis,
  volumeThreshold: number = 1.5,
  priceThreshold: number = 2
): boolean {
  return (
    volume.ratio > volumeThreshold &&
    Math.abs(price.percentageChange) > priceThreshold
  );
}

/**
 * Format large numbers for display
 */
export function formatLargeNumber(num: number, currency: string = 'USD'): string {
  if (currency === 'USD') {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  }

  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Calculate signal strength (0-100)
 */
export function calculateSignalStrength(
  volumeRatio: number,
  priceChangePercent: number,
  volumeWeight: number = 0.4,
  priceWeight: number = 0.6
): number {
  // Volume component (0-100)
  const volumeScore = Math.min((volumeRatio - 1) * 50, 100);

  // Price component (0-100)
  const priceScore = Math.min(Math.abs(priceChangePercent) * 5, 100);

  // Combined score
  return Math.round(volumeScore * volumeWeight + priceScore * priceWeight);
}

/**
 * Filter signals by criteria
 */
export function filterSignals<T extends { timestamp: Date; category: string }>(
  signals: T[],
  filters: {
    category?: 'crypto' | 'stocks' | 'all';
    timeframe?: number; // minutes
    minStrength?: number; // 0-100
  }
): T[] {
  let filtered = signals;

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(s => s.category === filters.category);
  }

  // Filter by timeframe
  if (filters.timeframe) {
    const cutoffTime = new Date(Date.now() - filters.timeframe * 60 * 1000);
    filtered = filtered.filter(s => s.timestamp > cutoffTime);
  }

  return filtered;
}

/**
 * Rank signals by strength/relevance
 */
export function rankSignals<T extends { timestamp: Date }>(signals: T[]): T[] {
  return [...signals].sort((a, b) => {
    // More recent signals first
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}
