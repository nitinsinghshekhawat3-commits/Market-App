const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Minimal CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'Test server running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ TEST SERVER RUNNING ON PORT ${PORT}\n`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
