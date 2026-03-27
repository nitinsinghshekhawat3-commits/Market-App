// Stock symbol to company domain mapping
const symbolToDomainMap: { [key: string]: string } = {
  // Tech
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'NVDA': 'nvidia.com',
  'TSLA': 'tesla.com',
  'META': 'meta.com',
  'AMZN': 'amazon.com',
  'IBM': 'ibm.com',
  'INTEL': 'intel.com',
  'AMD': 'amd.com',
  'CRM': 'salesforce.com',
  'ADBE': 'adobe.com',
  'NFLX': 'netflix.com',
  'PYPL': 'paypal.com',
  'ACN': 'accenture.com',
  'TXN': 'ti.com',
  'QCOM': 'qualcomm.com',
  'CSCO': 'cisco.com',
  'AVGO': 'broadcom.com',

  // Finance
  'JPM': 'jpmorganchase.com',
  'BAC': 'bankofamerica.com',
  'WFC': 'wellsfargo.com',
  'GS': 'goldmansachs.com',
  'MS': 'morganstanley.com',
  'BLK': 'blackrock.com',
  'SCHW': 'schwab.com',
  'AXP': 'americanexpress.com',

  // Retail & E-commerce
  'WMT': 'walmart.com',
  'MCD': 'mcdonalds.com',
  'KO': 'coca-cola.com',
  'PEP': 'pepsico.com',
  'SBUX': 'starbucks.com',
  'NKE': 'nike.com',
  'MU': 'micron.com',

  // Healthcare
  'JNJ': 'jnj.com',
  'PFE': 'pfizer.com',
  'MRNA': 'modernatx.com',
  'UNH': 'unitedhealthgroup.com',
  'ABT': 'abbott.com',
  'ABBV': 'abbvie.com',

  // Energy
  'XOM': 'exxonmobil.com',
  'CVX': 'chevron.com',
  'MPC': 'marathonpetroleum.com',

  // India specific
  'RELIANCE.NS': 'ril.com',
  'TCS.NS': 'tcs.com',
  'HDFCBANK.NS': 'hdfcbank.com',
  'INFY.NS': 'infosys.com',
  'WIPRO.NS': 'wipro.com',
  'LT.NS': 'larsentoubro.com',
  'BAJAJFINSV.NS': 'bajaajfinserv.com',
  'MARUTI.NS': 'maruti.co.in',
  'ADANIPOWER.NS': 'adanipower.com',
  'ICICIBANK.NS': 'icicibank.com',

  // Crypto (will use alternative if available)
  'BTC-USD': 'bitcoin.org',
  'ETH-USD': 'ethereum.org',
  'SOL-USD': 'solana.com',
  'ADA-USD': 'cardano.org',
  'XRP-USD': 'ripple.com',
  'DOT-USD': 'polkadot.network',
  'BITCOIN': 'bitcoin.org',
  'ETHEREUM': 'ethereum.org',
  'SOLANA': 'solana.com',
  'CARDANO': 'cardano.org',
  'RIPPLE': 'ripple.com',
  'POLKADOT': 'polkadot.network',
};

// Cache for logo URLs to avoid repeated API calls
const logoCache = new Map<string, string>();

export async function getCompanyLogoUrl(symbol: string): Promise<string | null> {
  // Check cache first
  if (logoCache.has(symbol)) {
    return logoCache.get(symbol) || null;
  }

  // Get domain from mapping
  let domain = symbolToDomainMap[symbol];

  // If no mapping, try to construct domain from symbol
  if (!domain) {
    // Remove common suffixes for India stocks
    const cleanSymbol = symbol.replace(/\.NS$|\.BO$/, '');
    // Try lowercase symbol + .com
    domain = `${cleanSymbol.toLowerCase()}.com`;
  }

  try {
    // Use Google Favicons API as fallback
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    
    // Cache the URL (we assume it works)
    logoCache.set(symbol, logoUrl);
    return logoUrl;
  } catch (error) {
    console.error(`Failed to get logo for ${symbol}:`, error);
    logoCache.set(symbol, ''); // Cache failed attempt to avoid repeated calls
    return null;
  }
}

// Preload common stock logos
export function preloadCommonLogos() {
  const commonSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN',
    'BTC-USD', 'ETH-USD', 'SOL-USD', 'RELIANCE.NS', 'TCS.NS',
  ];
  
  commonSymbols.forEach(symbol => {
    getCompanyLogoUrl(symbol).catch(() => {}); // Preload in background
  });
}
