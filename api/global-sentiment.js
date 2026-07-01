// Vercel serverless function for global sentiment
import YahooFinance from 'yahoo-finance2';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

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
    const yf = new YahooFinance();
    const countryIndices = [
      { country: "USA", symbol: "^GSPC", indexName: "S&P 500" },
      { country: "India", symbol: "^NSEI", indexName: "NIFTY 50" },
      { country: "UK", symbol: "^FTSE", indexName: "FTSE 100" },
    ];

    const symbols = countryIndices.map((c) => c.symbol);
    const quotes = await yf.quote(symbols, { timeout: 10000 });

    const results = countryIndices.map((item) => {
      const quote = Array.isArray(quotes) ? quotes.find((q) => q.symbol === item.symbol) : quotes;
      return {
        country: item.country,
        index: item.indexName,
        price: quote?.regularMarketPrice,
        change: quote?.regularMarketChangePercent,
      };
    });

    res.json(results);

  } catch (error) {
    console.error("Global Sentiment API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch global sentiment" });
  }
}
