// Vercel serverless function for stock data
import axios from 'axios';

let yahooFinance = null;

async function getYahooFinance() {
  if (!yahooFinance) {
    try {
      const YahooFinance = (await import('yahoo-finance2')).default;
      yahooFinance = new YahooFinance();
    } catch (err) {
      console.error('[ERROR] Failed to load Yahoo Finance:', err.message);
      throw err;
    }
  }
  return yahooFinance;
}

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Mock stock data for fallback
const MOCK_STOCKS = {
  'AAPL': {
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    regularMarketPrice: 175.43,
    regularMarketChange: 2.15,
    regularMarketChangePercent: 1.24,
    currency: 'USD',
    regularMarketVolume: 52847392,
    marketCap: 2740000000000,
    logoUrl: 'https://logo.clearbit.com/apple.com'
  },
  'TSLA': {
    symbol: 'TSLA',
    shortName: 'Tesla, Inc.',
    regularMarketPrice: 248.42,
    regularMarketChange: -5.67,
    regularMarketChangePercent: -2.23,
    currency: 'USD',
    regularMarketVolume: 89543210,
    marketCap: 790000000000,
    logoUrl: 'https://logo.clearbit.com/tesla.com'
  },
  'NVDA': {
    symbol: 'NVDA',
    shortName: 'NVIDIA Corporation',
    regularMarketPrice: 875.28,
    regularMarketChange: 15.42,
    regularMarketChangePercent: 1.79,
    currency: 'USD',
    regularMarketVolume: 45678912,
    marketCap: 2150000000000,
    logoUrl: 'https://logo.clearbit.com/nvidia.com'
  },
  'MSFT': {
    symbol: 'MSFT',
    shortName: 'Microsoft Corporation',
    regularMarketPrice: 415.26,
    regularMarketChange: 3.87,
    regularMarketChangePercent: 0.94,
    currency: 'USD',
    regularMarketVolume: 23456789,
    marketCap: 3080000000000,
    logoUrl: 'https://logo.clearbit.com/microsoft.com'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    shortName: 'Alphabet Inc.',
    regularMarketPrice: 142.56,
    regularMarketChange: 1.23,
    regularMarketChangePercent: 0.87,
    currency: 'USD',
    regularMarketVolume: 34567890,
    marketCap: 1780000000000,
    logoUrl: 'https://logo.clearbit.com/google.com'
  },
  'RELIANCE.NS': {
    symbol: 'RELIANCE.NS',
    shortName: 'Reliance Industries Limited',
    regularMarketPrice: 2950.75,
    regularMarketChange: 25.50,
    regularMarketChangePercent: 0.87,
    currency: 'INR',
    regularMarketVolume: 5678901,
    marketCap: 18000000000000,
    logoUrl: 'https://logo.clearbit.com/relianceindustries.com'
  }
};

export default async function handler(req, res) {
  setCORS(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Try to fetch real data first
    try {
      const yf = await getYahooFinance();
      const quote = await yf.quote(symbol);
      const history = await yf.chart(symbol, {
        period1: "2023-01-01",
      });

      let logoUrl = null;
      try {
        const summary = await yf.quoteSummary(symbol, { modules: ['summaryDetail'] });
        if (summary && summary.summaryDetail && summary.summaryDetail.logoUrl) {
          logoUrl = summary.summaryDetail.logoUrl;
        }
      } catch (logoError) {
        console.log(`Logo not available for ${symbol}`);
      }

      res.json({ quote: { ...quote, logoUrl }, history });
    } catch (yahooError) {
      console.log(`Yahoo Finance failed for ${symbol}, using mock data:`, yahooError.message);
      
      // Fallback to mock data
      const mockData = MOCK_STOCKS[symbol];
      if (mockData) {
        // Mock history data
        const mockHistory = {
          timestamp: Array.from({length: 365}, (_, i) => Date.now() - (365 - i) * 24 * 60 * 60 * 1000),
          open: Array.from({length: 365}, () => mockData.regularMarketPrice + (Math.random() - 0.5) * 20),
          high: Array.from({length: 365}, () => mockData.regularMarketPrice + Math.random() * 30),
          low: Array.from({length: 365}, () => mockData.regularMarketPrice - Math.random() * 30),
          close: Array.from({length: 365}, () => mockData.regularMarketPrice + (Math.random() - 0.5) * 20),
          volume: Array.from({length: 365}, () => Math.floor(Math.random() * 10000000))
        };
        
        res.json({ quote: mockData, history: mockHistory });
      } else {
        res.status(404).json({ error: `No data available for symbol: ${symbol}` });
      }
    }

  } catch (error) {
    console.error("Stock API Error:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
