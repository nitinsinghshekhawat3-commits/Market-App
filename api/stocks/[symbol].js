// Vercel serverless function for stock data
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
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const yf = new YahooFinance();
    const quote = await yf.quote(symbol, { timeout: 10000 });
    const history = await yf.chart(symbol, {
      period1: "2023-01-01",
      timeout: 10000,
    });

    let logoUrl = null;
    try {
      const summary = await yf.quoteSummary(symbol, { 
        modules: ['summaryDetail'],
        timeout: 5000
      });
      if (summary && summary.summaryDetail && summary.summaryDetail.logoUrl) {
        logoUrl = summary.summaryDetail.logoUrl;
      }
    } catch (logoError) {
      console.log(`Logo not available for ${symbol}`);
    }

    res.json({ quote: { ...quote, logoUrl }, history });

  } catch (error) {
    console.error("Stock API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data", details: error.message });
  }
}
