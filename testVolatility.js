// Test script to verify volatility calculations
import axios from 'axios';

const testAssets = [
  { symbol: 'BTC-USD', type: 'crypto', name: 'Bitcoin' },
  { symbol: 'ETH-USD', type: 'crypto', name: 'Ethereum' },
  { symbol: 'AAPL', type: 'stock', name: 'Apple' },
  { symbol: 'MSFT', type: 'stock', name: 'Microsoft' },
  { symbol: 'RELIANCE.NS', type: 'stock', name: 'Reliance' }
];

async function testVolatility() {
  console.log('\n=== VOLATILITY CALCULATION TEST ===\n');
  console.log('Testing institutional volatility metrics...\n');
  
  for (const asset of testAssets) {
    try {
      let endpoint = asset.type === 'crypto' 
        ? `http://localhost:3000/api/crypto/${asset.symbol.split('-')[0].toLowerCase()}`
        : `http://localhost:3000/api/stocks/${asset.symbol}`;
      
      console.log(`Fetching ${asset.name} (${asset.symbol})...`);
      const response = await axios.get(endpoint);
      const data = response.data;
      
      let volatility;
      let priceChange;
      let volumeRatio;
      let price;
      
      if (asset.type === 'crypto') {
        const marketData = data.market_data;
        if (!marketData) {
          console.log(`  ERROR: No market_data in response\n`);
          continue;
        }
        
        // Calculate volatility from price change history
        const change24h = Math.abs(marketData.price_change_percentage_24h || 0);
        const change7d = Math.abs(marketData.price_change_percentage_7d_in_currency?.usd || 0);
        const change30d = Math.abs(marketData.price_change_percentage_30d_in_currency?.usd || 0);
        
        volatility = (change24h * 0.4 + (change7d / 7) * 0.35 + (change30d / 30) * 0.25) / 100;
        volatility = Math.min(Math.max(volatility, 0.01), 0.5);
        
        priceChange = marketData.price_change_percentage_24h || 0;
        price = marketData.current_price?.usd || 0;
        volumeRatio = Math.max(1, 1 + Math.abs(priceChange / 100));
        
        console.log(`  Price: $${price.toFixed(2)}`);
        console.log(`  24h Change: ${priceChange.toFixed(2)}%`);
      } else {
        const quote = data.quote;
        const history = data.history;
        price = quote.regularMarketPrice || 0;
        priceChange = quote.regularMarketChangePercent || 0;
        
        // Calculate historical volatility
        if (history?.quotes && history.quotes.length > 1) {
          const closePrices = history.quotes.slice(-20).map(q => q.close || 0).filter(p => p > 0);
          if (closePrices.length > 1) {
            const returns = [];
            for (let i = 1; i < closePrices.length; i++) {
              returns.push((closePrices[i] - closePrices[i-1]) / closePrices[i-1]);
            }
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
            volatility = Math.sqrt(variance);
          } else {
            volatility = 0.05;
          }
        } else {
          volatility = 0.05;
        }
        
        const volumes = history?.quotes?.slice(-20)?.map(q => q.volume || 0) || [];
        const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        volumeRatio = (quote.regularMarketVolume || 0) / avgVol || 1;
        
        console.log(`  Price: $${price.toFixed(2)}`);
        console.log(`  24h Change: ${priceChange.toFixed(2)}%`);
      }
      
      console.log(`  Volatility: ${(volatility * 100).toFixed(2)}%`);
      console.log(`  Volume Ratio: ${volumeRatio.toFixed(2)}x\n`);
      
    } catch (error) {
      console.log(`  ERROR: ${error.response?.status || error.code} - ${error.message}\n`);
    }
  }
}

testVolatility();
