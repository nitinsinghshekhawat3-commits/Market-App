#!/usr/bin/env node

/**
 * MINIMAL BACKEND SERVER
 * This works on Railway, Vercel, Heroku, or local
 * No external dependencies required!
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Simple request handler
const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Routes
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Backend is running!'
    }));
  }
  
  else if (pathname === '/api/fx' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ rate: 94.5 }));
  }
  
  else if (pathname === '/api/sectors' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { name: 'Technology', change: 1.2, color: 'bg-primary' },
      { name: 'Finance', change: -0.5, color: 'bg-negative' },
      { name: 'Energy', change: 2.1, color: 'bg-primary' },
      { name: 'Healthcare', change: -0.3, color: 'bg-negative' },
    ]));
  }
  
  else if (pathname === '/api/markets' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { symbol: '^GSPC', regularMarketPrice: 5200, regularMarketChangePercent: 0.5 },
      { symbol: '^IXIC', regularMarketPrice: 16200, regularMarketChangePercent: 1.2 },
      { symbol: '^NSEI', regularMarketPrice: 79000, regularMarketChangePercent: -0.3 },
    ]));
  }
  
  else if (pathname === '/api/global-sentiment' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { country: 'USA', index: 'S&P 500', price: 5200, change: 0.5 },
      { country: 'India', index: 'NIFTY 50', price: 22000, change: 1.2 },
      { country: 'UK', index: 'FTSE 100', price: 7800, change: -0.2 },
    ]));
  }
  
  else if (pathname.startsWith('/api/crypto/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    res.writeHead(200);
    res.end(JSON.stringify({ 
      id: id,
      market_data: { current_price: { usd: 45000 } }
    }));
  }
  
  else if (pathname === '/api/ai/analyze' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      analysis: JSON.stringify({
        aiScore: 75,
        trend: 'Bullish',
        riskScore: 'Medium',
        summary: 'Strong upward momentum',
        suggestion: 'Buy',
        pros: ['Good fundamentals', 'Strong growth'],
        cons: ['High valuation', 'Market volatility']
      })
    }));
  }
  
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  }
};

// Create server
const server = http.createServer(requestHandler);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════╗
║  ✅ MINIMAL BACKEND SERVER RUNNING  ║
╚════════════════════════════════════╝
  PORT: ${PORT}
  STATUS: ONLINE
  HEALTH CHECK: /health
  `);
});

server.on('error', (err) => {
  console.error('[ERROR] Server failed:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});
