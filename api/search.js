// Vercel serverless function for search autocomplete
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
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const yf = await getYahooFinance();
    const results = await yf.search(q);
    res.json(results.quotes || []);

  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ error: "Failed to search" });
  }
}
