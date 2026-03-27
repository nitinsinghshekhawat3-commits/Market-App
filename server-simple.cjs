const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple endpoint
app.get('/health', (req, res) => {
  console.log('[LOG] Health check requested');
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  console.log('[LOG] Test endpoint called');
  res.json({ message: 'Backend is working!' });
});

app.get('/api/fx', (req, res) => {
  console.log('[LOG] FX endpoint called');
  res.json({ rate: 94.5 });
});

// Start server
const server = app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ SERVER STARTED ON PORT ${PORT}`);
});

server.on('error', (err) => {
  console.error(`[ERROR] Server failed:`, err.message);
  process.exit(1);
});
