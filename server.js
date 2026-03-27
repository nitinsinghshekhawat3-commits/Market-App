import express from "express";
import cors from "cors"; // ✅ ADDED
import path from "path";
import YahooFinance from "yahoo-finance2";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Groq API Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const yahooFinance = new YahooFinance();

async function startServer() {
  const app = express();
const PORT = process.env.PORT || 3000;

  app.use(cors()); // ✅ ADDED
  app.use(express.json());

  // 1. Stock Data (Yahoo Finance)
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await yahooFinance.quote(symbol);
      const history = await yahooFinance.chart(symbol, {
        period1: "2023-01-01",
      });

      let logoUrl = null;
      try {
        const summary = await yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail'] });
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
      const symbols = ["^GSPC", "^IXIC", "^NSEI", "BTC-USD", "ETH-USD"];
      const quotes = await yahooFinance.quote(symbols);

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
      const { q } = req.query;
      if (!q) return res.json([]);

      const results = await yahooFinance.search(q);
      res.json(results.quotes || []);

    } catch (error) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // 5. Sector Performance
  app.get("/api/sectors", async (req, res) => {
    try {
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
          { name: 'Information Technology', symbol: '^CNXIT' },
          { name: 'Banking & Financial Services', symbol: '^NSEBANK' },
          { name: 'Energy', symbol: '^NSEENRGY' },
          { name: 'Pharmaceuticals', symbol: '^NSEPHARMA' },
          { name: 'Automotive', symbol: '^NSEAUTO' },
          { name: 'Consumer Goods', symbol: '^NSECG' },
        ],
      };

      const definition = sectorDefinitions[country] || sectorDefinitions.US;
      const symbols = definition.map(s => s.symbol);

      const quotes = await yahooFinance.quote(symbols);
      let quoteArray = Array.isArray(quotes) ? quotes : [quotes];

      const data = definition.map((sector, idx) => {
        const q = quoteArray[idx] || {};
        const change = q.regularMarketChangePercent ?? 0;
        return {
          name: sector.name,
          change: Number(change.toFixed(2)),
          color: change >= 0 ? 'bg-primary' : 'bg-negative',
        };
      });

      res.json(data);

    } catch (error) {
      console.error("Sectors API Error:", error);
      res.status(500).json({ error: "Failed to fetch sector data" });
    }
  });

  // 6. Currency Conversion
  app.get("/api/fx", async (req, res) => {
    try {
      const fx = await yahooFinance.quote("USDINR=X");
      res.json({ rate: fx.regularMarketPrice || 83.0 });
    } catch {
      res.json({ rate: 83.0 });
    }
  });

  // 7. Global Sentiment
  app.get("/api/global-sentiment", async (req, res) => {
    try {
      const countryIndices = [
        { country: "USA", symbol: "^GSPC", indexName: "S&P 500" },
        { country: "India", symbol: "^NSEI", indexName: "NIFTY 50" },
        { country: "UK", symbol: "^FTSE", indexName: "FTSE 100" },
      ];

      const symbols = countryIndices.map((c) => c.symbol);
      const quotes = await yahooFinance.quote(symbols);

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

  // 🔥🔥🔥 FIXED AI ROUTE (IMPORTANT CHANGE)
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

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});