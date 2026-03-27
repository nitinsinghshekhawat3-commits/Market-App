/**
 * Asset Search Service
 * Provides dynamic asset search and auto-detection for stocks and crypto
 */

export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  exchange?: string;
}

import { getApiUrl } from '../lib/apiConfig';

// Common crypto assets with CoinGecko IDs
const CRYPTO_ASSETS: Asset[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
  { symbol: 'XRP-USD', name: 'Ripple', type: 'crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'LINK-USD', name: 'Chainlink', type: 'crypto' },
  { symbol: 'LTC-USD', name: 'Litecoin', type: 'crypto' },
  { symbol: 'USDT-USD', name: 'Tether', type: 'crypto' },
];

// Common stock assets
const STOCK_ASSETS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
  { symbol: 'META', name: 'Meta', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock' },
  { symbol: 'V', name: 'Visa', type: 'stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', type: 'stock' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', type: 'stock' },
  { symbol: 'INFY.NS', name: 'Infosys', type: 'stock' },
];

/**
 * Auto-detect asset type based on symbol pattern
 */
export function autoDetectAssetType(symbol: string): 'stock' | 'crypto' {
  const upperSymbol = symbol.toUpperCase();
  
  // Crypto indicators
  if (
    upperSymbol.includes('-USD') ||
    upperSymbol === 'BTC' ||
    upperSymbol === 'ETH' ||
    upperSymbol === 'SOL' ||
    upperSymbol === 'XRP' ||
    upperSymbol === 'ADA' ||
    upperSymbol === 'BNB' ||
    upperSymbol === 'DOGE' ||
    upperSymbol === 'LINK' ||
    upperSymbol === 'LTC' ||
    upperSymbol === 'USDT'
  ) {
    return 'crypto';
  }
  
  // Stock indicators
  if (
    upperSymbol.includes('.NS') ||
    upperSymbol.includes('.BO') ||
    upperSymbol.includes('.MCX') ||
    symbol.length <= 5
  ) {
    return 'stock';
  }
  
  // Default to stock
  return 'stock';
}

/**
 * Get crypto ID from symbol (for CoinGecko API)
 */
export function getCryptoId(symbol: string): string {
  const CRYPTO_SYMBOL_MAP: Record<string, string> = {
    'BTC-USD': 'bitcoin',
    'BTC': 'bitcoin',
    'ETH-USD': 'ethereum',
    'ETH': 'ethereum',
    'SOL-USD': 'solana',
    'SOL': 'solana',
    'XRP-USD': 'ripple',
    'XRP': 'ripple',
    'ADA-USD': 'cardano',
    'ADA': 'cardano',
    'BNB-USD': 'binancecoin',
    'BNB': 'binancecoin',
    'DOGE-USD': 'dogecoin',
    'DOGE': 'dogecoin',
    'LINK-USD': 'chainlink',
    'LINK': 'chainlink',
    'LTC-USD': 'litecoin',
    'LTC': 'litecoin',
    'USDT-USD': 'tether',
    'USDT': 'tether',
  };
  
  return CRYPTO_SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
}

/**
 * Search for assets dynamically
 * Searches both pre-loaded assets and API when needed
 */
export async function searchAssets(query: string): Promise<Asset[]> {
  if (!query.trim()) {
    // Return most common assets if query is empty
    return [...CRYPTO_ASSETS.slice(0, 5), ...STOCK_ASSETS.slice(0, 5)];
  }

  const q = query.toLowerCase();
  
  // Search pre-loaded assets
  const preloadedResults = [
    ...CRYPTO_ASSETS,
    ...STOCK_ASSETS
  ].filter(asset =>
    asset.symbol.toLowerCase().includes(q) ||
    asset.name.toLowerCase().includes(q)
  );

  // If we have enough results from pre-loaded, return them
  if (preloadedResults.length >= 5) {
    return preloadedResults.slice(0, 10);
  }

  // Try to search via Yahoo Finance API for more results
  try {
    const response = await fetch(getApiUrl(`api/search?q=${encodeURIComponent(q)}`));
    if (response.ok) {
      const results = await response.json();
      
      // Convert API results to Asset format
      const apiAssets: Asset[] = results
        .slice(0, 10)
        .map((result: any) => ({
          symbol: result.symbol,
          name: result.longname || result.shortname || result.symbol,
          type: autoDetectAssetType(result.symbol),
          exchange: result.exchDisp
        }));

      // Combine and deduplicate
      const combined = [...preloadedResults, ...apiAssets];
      const unique = combined.filter((asset, index, self) =>
        index === self.findIndex(a => a.symbol === asset.symbol)
      );

      return unique.slice(0, 15);
    }
  } catch (error) {
    console.warn('API search failed, using pre-loaded assets:', error);
  }

  return preloadedResults;
}

/**
 * Get asset by symbol
 */
export async function getAsset(symbol: string): Promise<Asset | null> {
  // Check pre-loaded assets first
  const allAssets = [...CRYPTO_ASSETS, ...STOCK_ASSETS];
  const found = allAssets.find(a => a.symbol.toUpperCase() === symbol.toUpperCase());
  
  if (found) {
    return found;
  }

  // If not found, create an asset with auto-detected type
  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    type: autoDetectAssetType(symbol),
  };
}

/**
 * Get popular assets for initial load
 */
export function getPopularAssets(): Asset[] {
  return [
    ...CRYPTO_ASSETS.slice(0, 3),
    ...STOCK_ASSETS.slice(0, 3),
  ];
}
