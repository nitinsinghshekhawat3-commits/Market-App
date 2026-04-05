// Vercel serverless function for sector performance with market cap and top movers
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
    const { country = 'US', period = '1d' } = req.query;

    const sectorDefinitions = {
      US: [
        { name: 'Technology', symbol: 'XLK', stocks: ['AAPL', 'MSFT', 'NVDA', 'META', 'GOOGL'] },
        { name: 'Finance', symbol: 'XLF', stocks: ['JPM', 'BAC', 'GS', 'WFC', 'MS'] },
        { name: 'Energy', symbol: 'XLE', stocks: ['XOM', 'CVX', 'COP', 'MPC', 'EOG'] },
        { name: 'Healthcare', symbol: 'XLV', stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO'] },
        { name: 'Consumer Disc.', symbol: 'XLY', stocks: ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD'] },
        { name: 'Communication', symbol: 'XLC', stocks: ['META', 'NFLX', 'DIS', 'VZ', 'T'] },
        { name: 'Industrials', symbol: 'XLI', stocks: ['BA', 'CAT', 'GE', 'MMM', 'RTX'] },
        { name: 'Materials', symbol: 'XLB', stocks: ['LIN', 'APD', 'EC', 'NEM', 'FCX'] },
        { name: 'Utilities', symbol: 'XLU', stocks: ['NEE', 'DUK', 'SO', 'AEP', 'EXC'] },
        { name: 'Real Estate', symbol: 'XLRE', stocks: ['SPY', 'IVZ', 'PSA', 'SLG', 'AMT'] },
      ],
      IN: [
        { name: 'IT', symbol: '^CNXIT', stocks: ['INFY.NS', 'TCS.NS', 'WIPRO.NS', 'TECHM.NS', 'HCLTECH.NS'] },
        { name: 'Banking', symbol: '^NSEBANK', stocks: ['HDFC.NS', 'ICICIBANK.NS', 'AXISBANK.NS', 'KOTAKBANK.NS', 'SBIN.NS'] },
        { name: 'Energy', symbol: '^CNXENERGY', stocks: ['RELIANCE.NS', 'NTPC.NS', 'POWERGRID.NS', 'ONGC.NS', 'BPCL.NS'] },
        { name: 'Pharma', symbol: '^CNXPHARMA', stocks: ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'LUPIN.NS', 'GLENMARK.NS'] },
        { name: 'Auto', symbol: '^CNXAUTO', stocks: ['MARUTI.NS', 'BAJAJFINSV.NS', 'M&M.NS', 'EICHERMOT.NS', 'MAHINDRA.NS'] },
        { name: 'Consumer', symbol: '^CNXFMCG', stocks: ['NESTLEIND.NS', 'BRITANNIA.NS', 'ITC.NS', 'MARICO.NS', 'HINDUNILVR.NS'] },
        { name: 'Metals', symbol: '^CNXMETAL', stocks: ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'SAIL.NS', 'NATIONALUM.NS'] },
        { name: 'Telecom', symbol: '^NSETELE', stocks: ['BHARTIARTL.NS', 'IDEA.NS', 'TATACOMM.NS', 'RELIANCE.NS', 'VODAFONEIDEA.NS'] },
      ],
    };

    const definition = sectorDefinitions[country] || sectorDefinitions.US;
    const symbols = definition.map(s => s.symbol);

    const quotes = await yf.quote(symbols);
    let quoteArray = Array.isArray(quotes) ? quotes : [quotes];

    // Fetch top stocks in each sector for drill-down
    const sectorDataWithStocks = await Promise.all(
      definition.map(async (sector, idx) => {
        const q = quoteArray[idx] || {};
        const indexChange = typeof q.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : NaN;
        const indexMarketCap = typeof q.marketCap === 'number' ? q.marketCap : 0;

        // Fetch top stocks in sector
        let topStocks = [];
        try {
          const stockQuotes = await yf.quote(sector.stocks.slice(0, 3));
          let stocks = Array.isArray(stockQuotes) ? stockQuotes : [stockQuotes];
          topStocks = sector.stocks.slice(0, 3).map((symbol, i) => ({
            symbol,
            price: stocks[i]?.regularMarketPrice || 0,
            change: stocks[i]?.regularMarketChangePercent || 0,
          }));
        } catch (err) {
          console.error(`Failed to fetch stocks for ${sector.name}:`, err.message);
        }

        const fallbackSectorChange = topStocks.length
          ? topStocks.reduce((sum, item) => sum + (item.change || 0), 0) / topStocks.length
          : 0;

        const change = Number.isFinite(indexChange) ? indexChange : fallbackSectorChange;
        const marketCap = indexMarketCap > 0 ? indexMarketCap : 1000000000; // Default 1B if no index cap

        return {
          id: sector.name.toLowerCase().replace(/\s+/g, '-'),
          name: sector.name,
          symbol: sector.symbol,
          change: Number(change.toFixed(2)),
          marketCap: marketCap,
          displayValue: Math.round(marketCap / 1e9), // In billions
          topStocks: topStocks,
          volume: q.volume || 0,
        };
      })
    );

    // Sort by market cap for treemap
    const data = sectorDataWithStocks.sort((a, b) => b.marketCap - a.marketCap);

    res.json({
      data: data,
      timestamp: new Date().toISOString(),
      country: country,
      period: period,
    });

  } catch (error) {
    console.error("Sectors API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch sector data" });
  }
}
