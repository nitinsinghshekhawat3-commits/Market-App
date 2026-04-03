const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
try {
  dotenv.config();
  console.log('[INIT] Environment variables loaded');
} catch (e) {
  console.log('[INIT] No .env file found (ok in production)');
}

// Lazy load YahooFinance to avoid startup delays
let yahooFinance = null;

async function getYahooFinance() {
  if (!yahooFinance) {
    console.log('[INIT] Loading Yahoo Finance library...');
    try {
      const YahooFinance = require("yahoo-finance2").default;
      yahooFinance = new YahooFinance();
      console.log('[INIT] Yahoo Finance loaded successfully');
    } catch (err) {
      console.error('[ERROR] Failed to load Yahoo Finance:', err.message);
      throw err;
    }
  }
  return yahooFinance;
}

// Groq API Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

console.log('[STARTUP] Initializing Market App Server...');

async function startServer() {
  try {
    const PORT = process.env.PORT || 3000;
    console.log('[STARTUP] Configuration:');
    console.log('  - PORT:', PORT);
    console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('  - GROQ_API_KEY:', GROQ_API_KEY ? 'SET' : 'MISSING');
    
    const app = express();

  // Configure CORS - Allow all origins for frontend
  app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
    maxAge: 3600
  }));

  // Additional CORS headers middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Max-Age', '3600');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Stock Data (Yahoo Finance)
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const { symbol } = req.params;
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

    } catch (error) {
      console.error("Stock API Error:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // 2. Crypto Data (CoinGecko)
  app.get("/api/crypto/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
      );
      res.json(response.data);
    } catch (error) {
      console.error("Crypto API Error:", error);
      res.status(500).json({ error: "Failed to fetch crypto data" });
    }
  });

  // 3. Global Markets / Indices
  app.get("/api/markets", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const symbols = ["^GSPC", "^IXIC", "^NSEI", "BTC-USD", "ETH-USD"];
      const quotes = await yf.quote(symbols);

      if (Array.isArray(quotes)) {
        res.json(quotes);
      } else {
        res.json([quotes]);
      }
    } catch (error) {
      console.error("Markets API Error:", error);
      res.status(500).json({
        error: "Failed to fetch market data",
        details: error.message,
      });
    }
  });

  // 4. Search Autocomplete
  app.get("/api/search", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const { q } = req.query;
      if (!q) return res.json([]);

      const results = await yf.search(q);
      res.json(results.quotes || []);

    } catch (error) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // 5. Sector Performance
  app.get("/api/sectors", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const { country = 'US' } = req.query;

      const sectorDefinitions = {
        US: [
          { name: 'Technology', symbol: 'XLK' },
          { name: 'Finance', symbol: 'XLF' },
          { name: 'Energy', symbol: 'XLE' },
          { name: 'Healthcare', symbol: 'XLV' },
          { name: 'Consumer Discretionary', symbol: 'XLY' },
          { name: 'Communication Services', symbol: 'XLC' },
        ],
        IN: [
          { name: 'Information Technology', symbol: '^CNXIT', stocks: ['INFY.NS', 'TCS.NS', 'WIPRO.NS', 'TECHM.NS', 'HCLTECH.NS'] },
          { name: 'Banking & Financial Services', symbol: '^NSEBANK', stocks: ['HDFC.NS', 'ICICIBANK.NS', 'AXISBANK.NS', 'KOTAKBANK.NS', 'SBIN.NS'] },
          { name: 'Energy', symbol: '^CNXENERGY', stocks: ['RELIANCE.NS', 'NTPC.NS', 'POWERGRID.NS', 'ONGC.NS', 'BPCL.NS'] },
          { name: 'Pharmaceuticals', symbol: '^CNXPHARMA', stocks: ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'LUPIN.NS', 'GLENMARK.NS'] },
          { name: 'Automotive', symbol: '^CNXAUTO', stocks: ['MARUTI.NS', 'BAJAJFINSV.NS', 'M&M.NS', 'EICHERMOT.NS', 'MAHINDRA.NS'] },
          { name: 'Consumer Goods', symbol: '^CNXFMCG', stocks: ['NESTLEIND.NS', 'BRITANNIA.NS', 'ITC.NS', 'MARICO.NS', 'HINDUNILVR.NS'] },
        ],
      };

      const definition = sectorDefinitions[country] || sectorDefinitions.US;
      const symbols = definition.map(s => s.symbol);

      const quotes = await yf.quote(symbols);
      let quoteArray = Array.isArray(quotes) ? quotes : [quotes];

      const data = await Promise.all(definition.map(async (sector, idx) => {
        const q = quoteArray[idx] || {};
        const indexChange = typeof q.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : NaN;

        let topStocks = [];
        if (sector.stocks && Array.isArray(sector.stocks) && sector.stocks.length > 0) {
          try {
            const stockQuotes = await yahooFinance.quote(sector.stocks.slice(0, 3));
            const stocks = Array.isArray(stockQuotes) ? stockQuotes : [stockQuotes];
            topStocks = sector.stocks.slice(0, 3).map((symbol, i) => ({
              symbol,
              change: stocks[i]?.regularMarketChangePercent ?? 0,
            }));
          } catch (err) {
            console.error(`Failed to fetch top stocks for ${sector.name}:`, err.message);
          }
        }

        const fallbackChange = topStocks.length
          ? topStocks.reduce((sum, s) => sum + (s.change || 0), 0) / topStocks.length
          : 0;

        const change = Number.isFinite(indexChange) ? indexChange : fallbackChange;

        return {
          name: sector.name,
          change: Number(change.toFixed(2)),
          color: change >= 0 ? 'bg-primary' : 'bg-negative',
        };
      }));

      res.json(data);

    } catch (error) {
      console.error("Sectors API Error:", error);
      res.status(500).json({ error: "Failed to fetch sector data" });
    }
  });

  // 6. Currency Conversion
  app.get("/api/fx", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const fx = await yf.quote("USDINR=X");
      res.json({ rate: fx.regularMarketPrice || 83.0 });
    } catch {
      res.json({ rate: 83.0 });
    }
  });

  // 7. Global Sentiment
  app.get("/api/global-sentiment", async (req, res) => {
    try {
      const yf = await getYahooFinance();
      const countryIndices = [
        { country: "USA", symbol: "^GSPC", indexName: "S&P 500" },
        { country: "India", symbol: "^NSEI", indexName: "NIFTY 50" },
        { country: "UK", symbol: "^FTSE", indexName: "FTSE 100" },
      ];

      const symbols = countryIndices.map((c) => c.symbol);
      const quotes = await yf.quote(symbols);

      const results = countryIndices.map((item) => {
        const quote = quotes.find((q) => q.symbol === item.symbol);
        return {
          country: item.country,
          index: item.indexName,
          price: quote?.regularMarketPrice,
          change: quote?.regularMarketChangePercent,
        };
      });

      res.json(results);

    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // Server-side AI route for prompt proxy
  app.post('/api/ai', async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
      }

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.95,
          stream: false,
        }),
      });

      if (!groqResponse.ok) {
        const text = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, text);
        return res.status(500).json({ error: groqResponse.statusText });
      }

      const data = await groqResponse.json();
      return res.json({ text: data.choices?.[0]?.message?.content || '' });

    } catch (error) {
      console.error('AI endpoint error:', error);
      return res.status(500).json({ error: 'AI request failed', details: error.message });
    }
  });

  // 🔥🔥🔥 LEGACY AI analyze route (optional)
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { symbol, data } = req.body;

      if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY not configured" });
      }

      const prompt = `Analyze the following stock and provide a professional financial analysis.

Stock:
Symbol: ${symbol}
Price: ${data?.price}
Change: ${data?.change}%
Market Cap: ${data?.marketCap}
Volume: ${data?.volume}
Summary: ${data?.summary || 'N/A'}

Provide your response in valid JSON format only:
{
  "aiScore": number (0-100),
  "trend": "Bullish" | "Bearish" | "Neutral",
  "riskScore": "Low" | "Medium" | "High",
  "summary": "string (detailed financial analysis)",
  "suggestion": "Buy" | "Sell" | "Hold",
  "pros": ["string"],
  "cons": ["string"],
  "futurePlans": "string"
}`;

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        })
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        return res.status(500).json({ error: `Groq API error: ${groqResponse.statusText}` });
      }

      const groqData = await groqResponse.json();
      const text = groqData.choices?.[0]?.message?.content || '';

      res.json({ analysis: text });

    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI analysis failed", details: error.message });
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    const time = new Date().toISOString();
    console.log(`[${time}] ✅ SERVER STARTED SUCCESSFULLY`);
    console.log(`[${time}] 📍 Listen on: 0.0.0.0:${PORT}`);
    console.log(`[${time}] 🌐 Health check: /health`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error(`[ERROR] Server failed to start:`, err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`  Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Handle connection errors
  app.use((err, req, res, next) => {
    console.error(`[ERROR] Request failed:`, err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[ERROR] Uncaught Exception:', err.message);
    // Don't exit - keep running
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('[SHUTDOWN] Server closed');
      process.exit(0);
    });
  });

  } catch (error) {
    console.error('[FATAL] Failed to initialize server:', error.message);
    console.error(error.stack);
    setTimeout(() => process.exit(1), 1000);
  }
}

// Start the server
console.log('[STARTUP] Attempting to start server...');
startServer().catch(error => {
  console.error('[FATAL] Server startup failed:', error.message);
  console.error(error.stack);
  setTimeout(() => process.exit(1), 1000);
});