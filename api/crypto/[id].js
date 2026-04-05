// Vercel serverless function for crypto data
import axios from 'axios';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

const MOCK_CRYPTO = {
  bitcoin: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    market_data: {
      current_price: { usd: 6219677.71 },
      price_change_percentage_24h: 0.38,
      market_cap: { usd: 1200000000000 },
      total_volume: { usd: 32000000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png' },
    market_cap_rank: 1,
  },
  ethereum: {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    market_data: {
      current_price: { usd: 190387.73 },
      price_change_percentage_24h: 0.18,
      market_cap: { usd: 450000000000 },
      total_volume: { usd: 14000000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png' },
    market_cap_rank: 2,
  },
  solana: {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    market_data: {
      current_price: { usd: 125.50 },
      price_change_percentage_24h: 2.14,
      market_cap: { usd: 45000000000 },
      total_volume: { usd: 2000000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png' },
    market_cap_rank: 9,
  },
  cardano: {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    market_data: {
      current_price: { usd: 0.54 },
      price_change_percentage_24h: 1.02,
      market_cap: { usd: 20000000000 },
      total_volume: { usd: 800000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png' },
    market_cap_rank: 10,
  },
  ripple: {
    id: 'ripple',
    symbol: 'xrp',
    name: 'Ripple',
    market_data: {
      current_price: { usd: 0.56 },
      price_change_percentage_24h: -0.25,
      market_cap: { usd: 26500000000 },
      total_volume: { usd: 5000000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png' },
    market_cap_rank: 7,
  },
  polkadot: {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    market_data: {
      current_price: { usd: 6.20 },
      price_change_percentage_24h: 0.90,
      market_cap: { usd: 7500000000 },
      total_volume: { usd: 750000000 },
    },
    image: { thumb: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png' },
    market_cap_rank: 12,
  },
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
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Crypto ID is required' });
    }

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
      );
      res.json(response.data);
    } catch (apiError) {
      console.log(`CoinGecko failed for ${id}, using fallback mock data:`, apiError.message);
      const fallback = MOCK_CRYPTO[id.toLowerCase()];
      if (fallback) {
        res.json(fallback);
      } else {
        res.status(404).json({ error: `No fallback crypto data for id: ${id}` });
      }
    }

  } catch (error) {
    console.error("Crypto API Error:", error.message || error);
    res.status(500).json({ error: "Failed to fetch crypto data" });
  }
}
