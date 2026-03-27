# Deployment Guide - Market App (Vercel + Railway)

## Overview
- **Frontend**: Deployed on Vercel (https://market-app-murex.vercel.app)
- **Backend**: Deployed on Railway (https://market-app-production-05b2.up.railway.app)

## Environment Variables Setup

### 1. Vercel Frontend Configuration

Set these environment variables in Vercel Dashboard:

```
VITE_GROQ_API_KEY = your_groq_api_key_here
VITE_API_URL = https://market-app-production-05b2.up.railway.app
```

**How to set in Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project (market-app)
3. Settings → Environment Variables
4. Add the variables above (get Groq key from https://console.groq.com/keys)
5. Redeploy the project

### 2. Railway Backend Configuration

Set these environment variables in Railway Dashboard:

```
GROQ_API_KEY = your_groq_api_key_here
NODE_ENV = production
PORT = (automatic, set by Railway)
```

**How to set in Railway:**
1. Go to https://railway.app/dashboard
2. Select your project (market-app)
3. Click on your service
4. Variables tab
5. Add the variables above
6. Railway will automatically redeploy

## API Configuration

### Frontend API URLs

**Development** (when running locally):
```
http://localhost:3000  (Backend proxy in vite.config.ts)
```

**Production** (Vercel):
```
https://market-app-production-05b2.up.railway.app  (from VITE_API_URL)
```

The frontend dynamically selects the correct API URL via `src/lib/apiConfig.js`:
- Uses `VITE_API_URL` env variable if available
- Falls back to `VITE_API_BASE` for backward compatibility
- Development defaults to `http://localhost:3000`
- Production defaults to Railway backend URL

### Backend API Endpoints

All endpoints are available at the Railway URL:

```
GET    /health                     (Health check)
GET    /api/stocks/:symbol         (Stock quotes)
GET    /api/crypto/:id             (Crypto data)
GET    /api/markets                (Market data)
GET    /api/search                 (Search stocks/crypto)
GET    /api/sectors                (Sector performance)
GET    /api/fx                     (Currency conversion)
GET    /api/global-sentiment       (Global market sentiment)
POST   /api/ai/analyze             (AI stock analysis)
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (local development)
- `http://localhost:5173` (local Vite dev server)
- `https://market-app-murex.vercel.app` (production frontend)
- `https://*.vercel.app` (preview URLs)

## Troubleshooting

### Frontend can't reach backend (CORS errors)

1. **Check environment variables in Vercel:**
   - Make sure `VITE_API_URL` is set correctly
   - Check that the URL doesn't have trailing slash

2. **Check browser console:**
   - Open DevTools → Network tab
   - Look for failed API requests
   - Check the URL being requested

3. **Test backend health:**
   ```bash
   curl https://market-app-production-05b2.up.railway.app/health
   ```

### Backend deployment failed

1. **Check Railway logs:**
   - Go to Railway Dashboard
   - Click your service
   - View logs for errors

2. **Verify environment variables:**
   - Make sure `GROQ_API_KEY` is set
   - Check that `PORT` is available (Railway sets it automatically)

3. **Test locally:**
   ```bash
   npm install
   npm start
   # Should see: 🚀 Market App Server Started
   ```

### API returning 502 Bad Gateway

This means the backend isn't responding. Try:

1. Check Railway service logs
2. Verify backend is running: `/health` endpoint
3. Check environment variables in Railway dashboard
4. Redeploy: Push changes to trigger automatic redeploy

## Local Development

### Running Both Services Locally

**Terminal 1 - Backend:**
```bash
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
# Proxy configured to http://localhost:3000
```

### Environment for Local Development

Use `.env.local` (already configured):
```env
VITE_GROQ_API_KEY=your_key
VITE_API_URL=http://localhost:3000
```

## Production Checklist

- [x] Backend server uses `process.env.PORT` (Railway sets this)
- [x] CORS configured for Vercel frontend domain
- [x] API Base URL set via `VITE_API_URL` environment variable
- [x] Groq API keys configured in both frontend and backend
- [x] Frontend build optimized for Vercel (Vite config ready)
- [x] Server uses CommonJS (better Railway compatibility)
- [x] Error handling and logging in place
- [x] Health check endpoint available

## API Testing

Test your deployment with curl:

```bash
# Test health
curl https://market-app-production-05b2.up.railway.app/health

# Test markets
curl https://market-app-production-05b2.up.railway.app/api/markets

# Test stock quote
curl "https://market-app-production-05b2.up.railway.app/api/stocks/AAPL"

# Test crypto
curl "https://market-app-production-05b2.up.railway.app/api/crypto/bitcoin"

# Test search
curl "https://market-app-production-05b2.up.railway.app/api/search?q=apple"
```

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
