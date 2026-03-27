import axios from 'axios';
import { getApiUrl } from '../lib/apiConfig';

export interface SmartMoneySignal {
  id: string;
  assetName: string;
  assetSymbol: string;
  signalType: 'whale_accumulation' | 'unusual_volume' | 'strong_buying' | 'strong_selling' | 'momentum_breakout';
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  amount: number;
  currency: string;
  percentage?: number;
  timestamp: Date;
  details: string;
  category: 'crypto' | 'stocks' | 'all';
  isNew?: boolean;
}

export interface MarketMetrics {
  symbol: string;
  currentVolume: number;
  averageVolume: number;
  volumeRatio: number;
  price: number;
  priceChange: number;
  volatility: number; // Historical volatility (not price change)
  timestamp: Date;
}

// Map crypto symbols to CoinGecko IDs
const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'BTC': 'bitcoin',
  'ETH-USD': 'ethereum',
  'ETH': 'ethereum',
  'SOL-USD': 'solana',
  'SOL': 'solana'
};

// Fetch real-time data for analysis
export async function fetchMarketMetrics(symbol: string, type: 'stock' | 'crypto'): Promise<MarketMetrics | null> {
  try {
    let endpoint = '';
    
    if (type === 'crypto') {
      // Map symbol to CoinGecko ID
      const coinId = CRYPTO_SYMBOL_MAP[symbol] || symbol.toLowerCase().replace('-usd', '');
      endpoint = getApiUrl(`api/crypto/${coinId}`);
    } else {
      endpoint = getApiUrl(`api/stocks/${symbol}`);
    }
    
    const response = await axios.get(endpoint);
    const data = response.data;

    if (type === 'crypto') {
      const marketData = data.market_data;
      
      if (!marketData || !marketData.current_price) {
        throw new Error(`Invalid crypto data for ${symbol}`);
      }

      const currentVolume = marketData?.total_volume?.usd || 0;
      const averageVolume = marketData?.total_volume?.usd || 0;
      const priceChange = marketData.price_change_percentage_24h || 0;
      
      // For crypto: Calculate volatility from price change history
      // Use 7d or 30d change data if available to get better volatility estimate
      const change7d = Math.abs(marketData.price_change_percentage_7d_in_currency?.usd || 0);
      const change30d = Math.abs(marketData.price_change_percentage_30d_in_currency?.usd || 0);
      const change24h = Math.abs(priceChange);
      
      // Volatility: average of different timeframes, normalized to daily equivalent
      // Higher volatility for volatile assets, lower for stable ones
      const volatilityEstimate = (change24h * 0.4 + (change7d / 7) * 0.35 + (change30d / 30) * 0.25) / 100;
      const volatility = Math.min(Math.max(volatilityEstimate, 0.01), 0.5); // Cap between 1% and 50%
      
      // For crypto, derive volume ratio from 24h price change
      const volumeRatio = Math.max(1, 1 + Math.abs(priceChange / 100));

      return {
        symbol,
        currentVolume,
        averageVolume,
        volumeRatio,
        price: marketData.current_price.usd || 0,
        priceChange,
        volatility,
        timestamp: new Date()
      };
    } else {
      const quote = data.quote;
      const history = data.history;
      
      if (!quote || !quote.regularMarketPrice) {
        throw new Error(`Invalid stock data for ${symbol}`);
      }

      // Calculate average volume from history
      const volumes = history?.quotes?.slice(-20)?.map((q: any) => q.volume || 0) || [];
      const averageVolume = volumes.length > 0 ? volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length : 0;
      const currentVolume = quote?.regularMarketVolume || 0;
      
      // Calculate historical volatility from price history (20-day standard deviation of returns)
      let volatility = 0.05; // Default 5% if not enough data
      
      if (history?.quotes && history.quotes.length > 1) {
        // Get closing prices from history
        const closePrices = history.quotes
          .slice(-20) // Use last 20 days
          .map((q: any) => q.close || 0)
          .filter((p: number) => p > 0);
        
        if (closePrices.length > 1) {
          // Calculate daily returns
          const returns: number[] = [];
          for (let i = 1; i < closePrices.length; i++) {
            const dailyReturn = (closePrices[i] - closePrices[i - 1]) / closePrices[i - 1];
            returns.push(dailyReturn);
          }
          
          // Calculate standard deviation of returns
          if (returns.length > 0) {
            const meanReturn = returns.reduce((a: number, b: number) => a + b, 0) / returns.length;
            const variance = returns.reduce((sum: number, r: number) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
            volatility = Math.sqrt(variance); // Daily volatility as decimal
          }
        }
      }
      
      // Clamp volatility between 0.5% and 30%
      volatility = Math.min(Math.max(volatility, 0.005), 0.3);

      return {
        symbol,
        currentVolume,
        averageVolume,
        volumeRatio: averageVolume > 0 ? currentVolume / averageVolume : 1,
        price: quote.regularMarketPrice || 0,
        priceChange: quote.regularMarketChangePercent || 0,
        volatility,
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error);
    return null;
  }
}

// Fetch crypto whale transactions
export async function fetchCryptoWhaleTransactions(): Promise<SmartMoneySignal[]> {
  try {
    const cryptos = [
      { symbol: 'BTC-USD', name: 'Bitcoin', threshold: 1000000 }, // $1M
      { symbol: 'ETH-USD', name: 'Ethereum', threshold: 500000 }   // $500K
    ];
    const signals: SmartMoneySignal[] = [];

    for (const { symbol, name, threshold } of cryptos) {
      const metrics = await fetchMarketMetrics(symbol, 'crypto');
      if (!metrics) continue;

      // Whale Activity: Transaction value > $1M
      if (metrics.currentVolume > threshold) {
        const confidence = metrics.currentVolume > threshold * 5 ? 'high' : 'medium';
        signals.push({
          id: `whale-${symbol}-${Date.now()}`,
          assetName: name,
          assetSymbol: symbol,
          signalType: 'whale_accumulation',
          signal: metrics.priceChange > 0 ? 'bullish' : 'bearish',
          confidence,
          amount: metrics.currentVolume,
          currency: 'USD',
          percentage: metrics.priceChange,
          timestamp: new Date(),
          details: `Whale ${metrics.priceChange > 0 ? 'accumulation' : 'distribution'}. Volume: $${formatLargeNumber(metrics.currentVolume)}`,
          category: 'crypto',
          isNew: true
        });
      }
    }

    return signals;
  } catch (error) {
    console.error('Error fetching crypto whale transactions:', error);
    return [];
  }
}

// Detect volume spikes in stocks
export async function detectStockVolumeSpikes(): Promise<SmartMoneySignal[]> {
  try {
    const stocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'RELIANCE.NS'];
    const signals: SmartMoneySignal[] = [];

    for (const symbol of stocks) {
      const metrics = await fetchMarketMetrics(symbol, 'stock');
      if (!metrics) continue;

      // Unusual Volume: current volume > 2x average
      if (metrics.volumeRatio > 2) {
        const volumePercent = (metrics.volumeRatio - 1) * 100;
        signals.push({
          id: `volume-spike-${symbol}-${Date.now()}`,
          assetName: symbol,
          assetSymbol: symbol,
          signalType: 'unusual_volume',
          signal: metrics.priceChange > 0.5 ? 'bullish' : metrics.priceChange < -0.5 ? 'bearish' : 'neutral',
          confidence: metrics.volumeRatio > 3 ? 'high' : 'medium',
          amount: metrics.currentVolume,
          currency: 'shares',
          percentage: metrics.priceChange,
          timestamp: new Date(),
          details: `Unusual volume spike: ${metrics.volumeRatio.toFixed(1)}x average`,
          category: 'stocks',
          isNew: true
        });
      }
    }

    return signals;
  } catch (error) {
    console.error('Error detecting volume spikes:', error);
    return [];
  }
}

// Strong Buying/Selling Detection: Price + Volume
export async function detectStrongPriceMoves(): Promise<SmartMoneySignal[]> {
  try {
    const assets = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD', 'MSFT', 'NVDA'];
    const signals: SmartMoneySignal[] = [];

    for (const asset of assets) {
      const type = asset.includes('-USD') ? 'crypto' : 'stock';
      const metrics = await fetchMarketMetrics(asset, type);
      if (!metrics) continue;

      // Strong Buying/Selling: Price move + high volume
      const isPriceUp = metrics.priceChange > 2;
      const isPriceDown = metrics.priceChange < -2;
      const isHighVolume = metrics.volumeRatio > 1.5;

      if ((isPriceUp || isPriceDown) && isHighVolume) {
        const isBullish = isPriceUp;
        signals.push({
          id: `strong-${asset}-${Date.now()}`,
          assetName: asset.includes('-USD') 
            ? (asset === 'BTC-USD' ? 'Bitcoin' : 'Ethereum')
            : asset,
          assetSymbol: asset,
          signalType: isBullish ? 'strong_buying' : 'strong_selling',
          signal: isBullish ? 'bullish' : 'bearish',
          confidence: 'high', // Price + volume = high confidence
          amount: metrics.currentVolume,
          currency: type === 'crypto' ? 'USD' : 'shares',
          percentage: metrics.priceChange,
          timestamp: new Date(),
          details: `${isBullish ? 'Strong buying' : 'Strong selling'} pressure. Price: ${Math.abs(metrics.priceChange).toFixed(2)}%, Volume: ${metrics.volumeRatio.toFixed(1)}x`,
          category: type === 'crypto' ? 'crypto' : 'stocks',
          isNew: true
        });
      }
    }

    return signals;
  } catch (error) {
    console.error('Error detecting strong price moves:', error);
    return [];
  }
}

// Momentum Breakout Detection: Price change > 2% in short timeframe
export async function detectMomentumBreakout(): Promise<SmartMoneySignal[]> {
  try {
    const assets = [
      { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
      { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
      { symbol: 'AAPL', name: 'Apple', type: 'stock' },
      { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
      { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
      { symbol: 'RELIANCE.NS', name: 'Reliance', type: 'stock' }
    ];
    const signals: SmartMoneySignal[] = [];

    for (const asset of assets) {
      const metrics = await fetchMarketMetrics(asset.symbol, asset.type as 'crypto' | 'stock');
      if (!metrics) continue;

      // Momentum Breakout: Price change > 2% in recent timeframe
      const absPriceChange = Math.abs(metrics.priceChange);
      if (absPriceChange > 2) {
        const confidence = absPriceChange > 5 ? 'high' : absPriceChange > 3 ? 'medium' : 'low';
        signals.push({
          id: `momentum-${asset.symbol}-${Date.now()}`,
          assetName: asset.name,
          assetSymbol: asset.symbol,
          signalType: 'momentum_breakout',
          signal: metrics.priceChange > 0 ? 'bullish' : 'bearish',
          confidence,
          amount: metrics.price,
          currency: asset.type === 'crypto' ? 'USD' : 'INR',
          percentage: metrics.priceChange,
          timestamp: new Date(),
          details: `Momentum breakout detected: ${absPriceChange.toFixed(2)}% move`,
          category: asset.type === 'crypto' ? 'crypto' : 'stocks',
          isNew: true
        });
      }
    }

    return signals;
  } catch (error) {
    console.error('Error detecting momentum breakout:', error);
    return [];
  }
}

// Combine all signals and fetch smart money activity
export async function fetchSmartMoneyActivity(category: 'crypto' | 'stocks' | 'all' = 'all'): Promise<SmartMoneySignal[]> {
  try {
    const signals: SmartMoneySignal[] = [];

    if (category === 'crypto' || category === 'all') {
      const whaleSignals = await fetchCryptoWhaleTransactions();
      const momentumSignals = (await detectMomentumBreakout()).filter(s => s.category === 'crypto');
      const strongMovesSignals = (await detectStrongPriceMoves()).filter(s => s.category === 'crypto');
      signals.push(...whaleSignals, ...momentumSignals, ...strongMovesSignals);
    }

    if (category === 'stocks' || category === 'all') {
      const volumeSignals = await detectStockVolumeSpikes();
      const momentumSignals = (await detectMomentumBreakout()).filter(s => s.category === 'stocks');
      const strongMovesSignals = (await detectStrongPriceMoves()).filter(s => s.category === 'stocks');
      signals.push(...volumeSignals, ...momentumSignals, ...strongMovesSignals);
    }

    // Sort by timestamp (newest first) and limit to avoid clutter
    const sorted = signals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
    
    // Mark recent signals as new (within last 10 seconds)
    const now = Date.now();
    return sorted.map(s => ({
      ...s,
      isNew: (now - s.timestamp.getTime()) < 10000
    }));
  } catch (error) {
    console.error('Error fetching smart money activity:', error);
    return [];
  }
}

// Format large numbers for display
function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}
