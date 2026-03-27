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

  } catch (error) {
    console.error("Stock API Error:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
