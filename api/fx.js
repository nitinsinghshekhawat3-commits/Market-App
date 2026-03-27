// Vercel serverless function for currency conversion (FX)
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
    const yf = await getYahooFinance();
    const fx = await yf.quote("USDINR=X");
    res.json({ rate: fx.regularMarketPrice || 83.0 });
  } catch (error) {
    console.error("FX API Error:", error.message);
    // Return fallback only if query fails
    res.json({ rate: 83.0 });
  }
}
