// Vercel serverless function for Indian stock heatmap data
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

// Top 25 Indian stocks per sector (NSE symbols)
const INDIAN_SECTORS = {
  Banking: ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTKBANK.NS', 'INDUSIND.NS', 'FEDERALBNK.NS', 'IDFCBANK.NS', 'BANDHANBNK.NS', 'HDFC.NS', 'IDBIBANK.NS', 'RBLBANK.NS', 'AUBANK.NS', 'DCBBANK.NS', 'SOUTHBANK.NS', 'CANARA.NS', 'INDIANB.NS', 'UNIONBANK.NS', 'UCOBANK.NS', 'BANKBARODA.NS', 'YESBANK.NS', 'DSPBANK.NS', 'PNBHOUSING.NS', 'AMBUJACEM.NS', 'PFC.NS'],
  IT: ['TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCL.NS', 'TECHM.NS', 'HCLTECH.NS', 'LT.NS', 'MINDTREE.NS', 'LTTS.NS', 'MPHASIS.NS', 'PERSISTENT.NS', 'CGPOWER.NS', 'KSOLVES.NS', 'POWERGRID.NS', 'BHARTIARTL.NS', 'HAPPIEST.NS', 'CYBERTECH.NS', 'HEXAWARE.NS', 'IGATE.NS', 'JAINMATRIX.NS', 'NAVINFO.NS', 'NAUKRI.NS', 'ORACLE.NS', 'PARADIGM.NS', 'SAILIND.NS'],
  Pharma: ['SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'LUPIN.NS', 'GLENMARK.NS', 'DIVISLAB.NS', 'AUROPHARM.NS', 'TORNTPHARM.NS', 'CADILAHC.NS', 'LALPATHLAB.NS', 'ALEMBICPH.NS', 'ZYDUSLIFE.NS', 'BAJAJPHARM.NS', 'BIOCON.NS', 'MOTHERSON.NS', 'NATPHARM.NS', 'PHARMAIND.NS', 'USV.NS', 'SUMITOMO.NS', 'MANKIND.NS', 'APOLLOHOSP.NS', 'FORTIS.NS', 'MAXHEALTH.NS', 'SMSPHARM.NS', 'VGUARD.NS'],
  FMCG: ['HINDUNILVR.NS', 'ITC.NS', 'NESTLE.NS', 'BRITANNIA.NS', 'MARICO.NS', 'COLPAL.NS', 'GODREJCP.NS', 'DABUR.NS', 'EMAMILTD.NS', 'BATLIBAT.NS', 'JYOTHYLAB.NS', 'KALYANKJIL.NS', 'GRINDWELL.NS', 'CAVINKARE.NS', 'ABSORB.NS', 'HALOMOIND.NS', 'HAWKINSCOOK.NS', 'MIDEASTI.NS', 'SANGHIIND.NS', 'SHALBY.NS', 'SNAPDEAL.NS', 'TITAN.NS', 'ADFOOD.NS', 'ALLCARGO.NS', 'ANMOL.NS'],
  Auto: ['MARUTI.NS', 'TATAMOTORS.NS', 'BAJAJ-AUTO.NS', 'HERO.NS', 'EICHERMOT.NS', 'MAHINDRA.NS', 'ASHOKLEYLAND.NS', 'FORCEMOTORS.NS', 'BAJAJFINSV.NS', 'HINDMOTOR.NS', 'MOTHERSON.NS', 'AUTOCLAD.NS', 'ADVINTAGE.NS', 'AUTOIND.NS', 'CARBORUNDUM.NS', 'DISA.NS', 'EXIDEIND.NS', 'GRAVITA.NS', 'INDIAHIRE.NS', 'JMFINANCIAL.NS', 'LUMAX.NS', 'PRECOT.NS', 'SUNDARMFIN.NS', 'SWARAJENG.NS', 'TITAGARH.NS'],
  Energy: ['RELIANCE.NS', 'NTPC.NS', 'POWERGRID.NS', 'ONGC.NS', 'BPCL.NS', 'IOC.NS', 'IOCL.NS', 'GAIL.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'NHPC.NS', 'TATAPOWER.NS', 'RPOWER.NS', 'MAHAGENCO.NS', 'TANGEDCO.NS', 'JINDALSTEL.NS', 'GSECL.NS', 'RENUKA.NS', 'SIEMENS.NS', 'THERMAX.NS', 'AUROPHARMA.NS', 'BALMLAWRENCE.NS', 'BANGALORE.NS', 'CCEAUTOMOBILES.NS', 'DCMSHRIRAM.NS'],
  Metal: ['TATASTEEL.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'NMDC.NS', 'JSW.NS', 'NATIONALAL.NS', 'JINDALSTEL.NS', 'MOIL.NS', 'SAIL.NS', 'METAL.NS', 'VEDL.NS', 'LUXINDUSTRI.NS', 'LLOYDSSTEEL.NS', 'STEELCITY.NS', 'USHA.NS', 'GPIL.NS', 'SOUTHSTEEL.NS', 'ELECTROSTEEL.NS', 'KALYANI.NS', 'KALUARJUN.NS', 'KIRLOSCOP.NS', 'LAKSHMIMARUTI.NS', 'LUXIND.NS', 'MAHAVIRLUK.NS', 'METINDUST.NS'],
  Infra: ['LARSEN.NS', 'ADANIPORTS.NS', 'ADANIENTER.NS', 'DLF.NS', 'RELINFRA.NS', 'INDIASEC.NS', 'GMM.NS', 'BUILDIND.NS', 'NAVARTIS.NS', 'MAHADEV.NS', 'SUNTECK.NS', 'BRIGADE.NS', 'LODHA.NS', 'MAFSEALING.NS', 'MIDHANI.NS', 'MIPL.NS', 'MOHAN.NS', 'MORGANSTLY.NS', 'MUKTAKASH.NS', 'NAVADMIN.NS', 'NAVBHARATTEO.NS', 'NIBE.NS', 'NIFTYBEES.NS', 'NLCINDIA.NS', 'NTPC.NS']
};

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
    const sectorData = {};

    // Fetch data for each sector in parallel
    const sectorEntries = await Promise.all(
      Object.entries(INDIAN_SECTORS).map(async ([sectorName, symbols]) => {
        try {
          // Fetch quotes for all stocks in sector in one go (bulk), this is more reliable and faster
          const allQuotes = await yf.quote(symbols);
          const quotes = Array.isArray(allQuotes) ? allQuotes : [allQuotes];

          // Format data
          const stocks = quotes
            .map((quote, idx) => {
              if (!quote || !quote.regularMarketPrice) return null;

              return {
                symbol: symbols[idx]?.replace('.NS', ''),
                fullSymbol: symbols[idx],
                price: quote.regularMarketPrice || 0,
                change: quote.regularMarketChangePercent || 0,
                marketCap: quote.marketCap || 0,
                volume: quote.volume || 0,
                name: quote.longName || symbols[idx],
              };
            })
            .filter((s) => s !== null)
            .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

          // If we still have fewer than 25, fallback to individual fetches for missing symbols
          if (stocks.length < 25) {
            const missing = symbols
              .filter((sym, idx) => !stocks.find((s) => s?.symbol === sym.replace('.NS', '')))
              .slice(0, 25 - stocks.length);
            for (const sym of missing) {
              try {
                const quote = await yf.quote(sym);
                if (quote && quote.regularMarketPrice) {
                  stocks.push({
                    symbol: sym.replace('.NS', ''),
                    fullSymbol: sym,
                    price: quote.regularMarketPrice || 0,
                    change: quote.regularMarketChangePercent || 0,
                    marketCap: quote.marketCap || 0,
                    volume: quote.volume || 0,
                    name: quote.longName || sym,
                  });
                }
              } catch (err) {
                console.error(`Fallback fetch failed ${sym}:`, err.message);
              }
            }
          }

          const topStocks = stocks
            .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
            .slice(0, 25);

          // Calculate sector stats using top 25 stocks
          const sectorChange = topStocks.reduce((sum, s) => sum + s.change, 0) / Math.max(topStocks.length, 1);
          const sectorMarketCap = topStocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);

          return [sectorName, {
            name: sectorName,
            stocks: topStocks,
            change: Number(sectorChange.toFixed(2)),
            marketCap: sectorMarketCap,
            gainers: topStocks.filter(s => s.change > 0).length,
            losers: topStocks.filter(s => s.change < 0).length,
          }];
        } catch (err) {
          console.error(`Error fetching sector ${sectorName}:`, err.message);
          return [sectorName, {
            name: sectorName,
            stocks: [],
            change: 0,
            marketCap: 0,
            gainers: 0,
            losers: 0,
          }];
        }
      })
    );

    // Convert back to object
    sectorEntries.forEach(([key, value]) => {
      sectorData[key] = value;
    });

    res.json({
      sectors: sectorData,
      timestamp: new Date().toISOString(),
      country: 'IN',
    });

  } catch (error) {
    console.error("India Heatmap API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch Indian market data",
      details: error.message 
    });
  }
}
