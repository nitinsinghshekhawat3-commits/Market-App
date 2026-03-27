// Vercel serverless function for sector performance
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

    const quotes = await yf.quote(symbols);
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
    console.error("Sectors API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch sector data" });
  }
}
