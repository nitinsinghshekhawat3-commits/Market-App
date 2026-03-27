import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Vercel backend is working!' });
});

// FX endpoint
app.get('/api/fx', async (req, res) => {
  try {
    // Fallback data if API fails
    res.json({ rate: 94.5 });
  } catch (err) {
    res.json({ rate: 94.5 });
  }
});

// Markets endpoint
app.get('/api/markets', async (req, res) => {
  try {
    res.json([
      { symbol: '^GSPC', regularMarketPrice: 5200, regularMarketChangePercent: 0.5 },
      { symbol: '^IXIC', regularMarketPrice: 16200, regularMarketChangePercent: 1.2 },
    ]);
  } catch (err) {
    res.json([]);
  }
});

// Crypto endpoint
app.get('/api/crypto/:id', async (req, res) => {
  res.json({ id: req.params.id, market_data: { current_price: { usd: 45000 } } });
});

// Sectors endpoint
app.get('/api/sectors', (req, res) => {
  res.json([
    { name: 'Technology', change: 1.2, color: 'bg-primary' },
    { name: 'Finance', change: -0.5, color: 'bg-negative' },
  ]);
});

// Global sentiment endpoint
app.get('/api/global-sentiment', (req, res) => {
  res.json([
    { country: 'USA', index: 'S&P 500', price: 5200, change: 0.5 },
    { country: 'India', index: 'NIFTY 50', price: 22000, change: 1.2 },
  ]);
});

// AI endpoint
app.post('/api/ai/analyze', (req, res) => {
  res.json({ 
    analysis: JSON.stringify({
      aiScore: 75,
      trend: 'Bullish',
      riskScore: 'Medium',
      summary: 'Strong upward momentum',
      suggestion: 'Buy',
      pros: ['Good fundamentals', 'Strong growth'],
      cons: ['High valuation', 'Market volatility']
    })
  });
});

export default app;
