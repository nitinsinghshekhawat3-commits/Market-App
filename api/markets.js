// Vercel serverless function for global markets
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
    const symbols = ["^GSPC", "^IXIC", "^NSEI", "BTC-USD", "ETH-USD"];
    const quotes = await yf.quote(symbols, { timeout: 10000 });

    if (Array.isArray(quotes)) {
      res.json(quotes);
    } else {
      res.json([quotes]);
    }

  } catch (error) {
    console.error("Markets API Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch market data",
      details: error.message,
    });
  }
}
