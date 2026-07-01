// Vercel serverless function for search autocomplete
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
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const yf = new YahooFinance();
    const results = await yf.search(q, { timeout: 10000 });
    res.json(results.quotes || []);

  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ error: "Failed to search", details: error.message });
  }
}
