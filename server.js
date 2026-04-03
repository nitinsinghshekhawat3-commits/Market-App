import express from "express";
import cors from "cors"; // ✅ ADDED
import path from "path";
import YahooFinance from "yahoo-finance2";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Groq API Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const yahooFinance = new YahooFinance();

// User storage (in-memory for demo - use database in production)
const usersById = new Map();
const usersByEmail = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors()); // ✅ ADDED
  app.use(express.json());

  // 1. Stock Data (Yahoo Finance)
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await yahooFinance.quote(symbol);
      const history = await yahooFinance.chart(symbol, {
        period1: "2023-01-01",
      });

      let logoUrl = null;
      try {
        const summary = await yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail'] });
        if (summary && summary.summaryDetail && summary.summaryDetail.logoUrl) {
          logoUrl = summary.summaryDetail.logoUrl;
        }
      } catch (logoError) {
        console.log(`Logo not available for ${symbol}`);
      }

      res.json({ quote: { ...quote, logoUrl }, history });

    } catch (error) {
      console.error("Stock API Error:", errors);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // 2. Crypto Data (CoinGecko)
  app.get("/api/crypto/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
      );
      res.json(response.data);
    } catch (error) {
      console.error("Crypto API Error:", error);
      res.status(500).json({ error: "Failed to fetch crypto data" });
    }
  });

  // 3. Global Markets / Indices
  app.get("/api/markets", async (req, res) => {
    try {
      const symbols = ["^GSPC", "^IXIC", "^NSEI", "BTC-USD", "ETH-USD"];
      const quotes = await yahooFinance.quote(symbols);

      if (Array.isArray(quotes)) {
        res.json(quotes);
      } else {
        res.json([quotes]);
      }
    } catch (error) {
      console.error("Markets API Error:", error);
      res.status(500).json({
        error: "Failed to fetch market data",
        details: error.message,
      });
    }
  });

  // 4. Search Autocomplete
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json([]);

      const results = await yahooFinance.search(q);
      res.json(results.quotes || []);

    } catch (error) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // 5. Sector Performance
  app.get("/api/sectors", async (req, res) => {
    try {
      const { country = 'US', period = '1d' } = req.query;

      const sectorDefinitions = {
        US: [
          { name: 'Technology', symbol: 'XLK', stocks: ['AAPL', 'MSFT', 'NVDA', 'META', 'GOOGL'] },
          { name: 'Finance', symbol: 'XLF', stocks: ['JPM', 'BAC', 'GS', 'WFC', 'MS'] },
          { name: 'Energy', symbol: 'XLE', stocks: ['XOM', 'CVX', 'COP', 'MPC', 'EOG'] },
          { name: 'Healthcare', symbol: 'XLV', stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO'] },
          { name: 'Consumer Discretionary', symbol: 'XLY', stocks: ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD'] },
          { name: 'Communication Services', symbol: 'XLC', stocks: ['META', 'NFLX', 'DIS', 'VZ', 'T'] },
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

      const quotes = await yahooFinance.quote(symbols);
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
            const stockQuotes = await yahooFinance.quote(sector.stocks.slice(0, 3));
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
      console.error("Sectors API Error:", error);
      res.status(500).json({ error: "Failed to fetch sector data" });
    }
  });

  // 6. Currency Conversion
  app.get("/api/fx", async (req, res) => {
    try {
      const fx = await yahooFinance.quote("USDINR=X");
      res.json({ rate: fx.regularMarketPrice || 83.0 });
    } catch {
      res.json({ rate: 83.0 });
    }
  });

  // 7. Global Sentiment
  app.get("/api/global-sentiment", async (req, res) => {
    try {
      const countryIndices = [
        { country: "USA", symbol: "^GSPC", indexName: "S&P 500" },
        { country: "India", symbol: "^NSEI", indexName: "NIFTY 50" },
        { country: "UK", symbol: "^FTSE", indexName: "FTSE 100" },
      ];

      const symbols = countryIndices.map((c) => c.symbol);
      const quotes = await yahooFinance.quote(symbols);

      const results = countryIndices.map((item) => {
        const quote = quotes.find((q) => q.symbol === item.symbol);
        return {
          country: item.country,
          index: item.indexName,
          price: quote?.regularMarketPrice,
          change: quote?.regularMarketChangePercent,
        };
      });

      res.json(results);

    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // 🔥🔥🔥 FIXED AI ROUTE (IMPORTANT CHANGE)
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { symbol, data } = req.body;

      if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY not configured" });
      }

      const prompt = `Analyze the following stock and provide a professional financial analysis.

Stock:
Symbol: ${symbol}
Price: ${data?.price}
Change: ${data?.change}%
Market Cap: ${data?.marketCap}
Volume: ${data?.volume}
Summary: ${data?.summary || 'N/A'}

Provide your response in valid JSON format only:
{
  "aiScore": number (0-100),
  "trend": "Bullish" | "Bearish" | "Neutral",
  "riskScore": "Low" | "Medium" | "High",
  "summary": "string (detailed financial analysis)",
  "suggestion": "Buy" | "Sell" | "Hold",
  "pros": ["string"],
  "cons": ["string"],
  "futurePlans": "string"
}`;

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        })
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        return res.status(500).json({ error: `Groq API error: ${groqResponse.statusText}` });
      }

      const groqData = await groqResponse.json();
      const text = groqData.choices?.[0]?.message?.content || '';

      res.json({ analysis: text });

    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI analysis failed", details: error.message });
    }
  });

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Lookup from in-memory user store (registered users)
      let userEntry = usersByEmail.get(email);

      // Legacy mock users fallback for existing demo accounts
      if (!userEntry) {
        const mockUsers = {
          "demo@marketstock.ai": { password: "demo123", name: "Demo User", id: "demo_user" },
          "user@example.com": { password: "password123", name: "Test User", id: "test_user" }
        };
        const fallback = mockUsers[email];
        if (fallback) {
          userEntry = { id: fallback.id, email, name: fallback.name, password: fallback.password, avatar: null };
        }
      }

      if (!userEntry || userEntry.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // For in-memory users, persist in maps if not already
      if (!usersById.has(userEntry.id)) {
        usersById.set(userEntry.id, userEntry);
      }
      if (!usersByEmail.has(email)) {
        usersByEmail.set(email, userEntry);
      }

      const token = btoa(`${userEntry.id}:${Date.now()}:${Math.random()}`);
      res.json({
        success: true,
        token,
        user: {
          id: userEntry.id,
          name: userEntry.name,
          email,
          avatar: userEntry.avatar || null
        }
      });

    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Prevent duplicate account by email
      if (usersByEmail.has(email)) {
        return res.status(409).json({ error: "Email already exists. Please sign in." });
      }

      // Create user entry and save to in-memory store
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: userId,
        name,
        email,
        password,
        avatar: null
      };

      usersById.set(userId, newUser);
      usersByEmail.set(email, newUser);

      const token = btoa(`${userId}:${Date.now()}:${Math.random()}`);

      res.json({
        success: true,
        token,
        user: {
          id: userId,
          name,
          email,
          avatar: null
        }
      });

    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token, userData } = req.body;

      console.log('[Google Auth] Received request:', {
        hasToken: !!token,
        email: userData?.email,
        name: userData?.name
      });

      if (!token || !userData) {
        return res.status(400).json({ 
          success: false,
          error: "Google token and user data are required" 
        });
      }

      // Check if this is a demo token (from demo mode)
      const isDemoToken = token && token.startsWith('demo_token_');
      
      if (isDemoToken) {
        console.log(`[Google Auth - Demo Mode] Email: ${userData.email}, Name: ${userData.name}`);
      } else {
        console.log(`[Google Auth] Verifying OAuth token...`);
        // In production, you would verify the JWT token with Google's public keys
        // https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=TOKEN
      }

      // Extract real user data from OAuth provider
      const googleUserId = userData.id;
      const googleEmail = userData.email;
      const googleName = userData.name;
      const googlePicture = userData.picture;

      // Validate required fields
      if (!googleEmail) {
        return res.status(400).json({ 
          success: false,
          error: "Email is required from OAuth provider" 
        });
      }

      if (!googleName) {
        return res.status(400).json({ 
          success: false,
          error: "Name is required from OAuth provider" 
        });
      }

      // Email verification check (skip for demo mode)
      if (!isDemoToken && userData.email_verified === false) {
        return res.status(403).json({ 
          success: false,
          error: "Please verify your email in Google account settings" 
        });
      }

      // Create persistent user ID based on OAuth provider ID
      // This ensures the same Google account always maps to the same user
      const userId = `google_${googleUserId}`;

      // Check if user already exists (already signed up)
      const existingUser = usersById.get(userId);
      if (existingUser) {
        console.log(`[Google Auth] ✅ EXISTING USER - Signing in:`, {
          userId,
          email: existingUser.email,
          name: existingUser.name
        });

        // Generate new session token for existing user
        const authToken = btoa(`${userId}:${Date.now()}:${Math.random()}`);

        return res.json({
          success: true,
          token: authToken,
          user: existingUser,  // Return existing user data
          message: "Welcome back! Signed in successfully."
        });
      }

      // NEW USER: Create and store user data
      const newUser = {
        id: userId,
        email: googleEmail,      // ✅ Real Gmail address from OAuth
        name: googleName,         // ✅ Real name from OAuth
        picture: googlePicture,   // ✅ Real profile picture from OAuth
        provider: 'google',
        email_verified: userData.email_verified || isDemoToken,
        registered_at: new Date().toISOString()
      };

      // Store user in memory (persist between requests)
      usersById.set(userId, newUser);
      usersByEmail.set(googleEmail, newUser);

      const authToken = btoa(`${userId}:${Date.now()}:${Math.random()}`);

      console.log(`[Google Auth] ✅ NEW USER - Signed up:`, {
        userId,
        email: googleEmail,
        name: googleName
      });

      return res.json({
        success: true,
        token: authToken,
        user: newUser,
        message: "Account created successfully! Welcome to MarketStock."
      });

    } catch (error) {
      console.error("[Google Auth] ❌ Error:", error);
      res.status(500).json({ 
        success: false,
        error: "Google authentication failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/auth/apple", async (req, res) => {
    try {
      const { token, userData } = req.body;

      console.log('[Apple Auth] Received request:', {
        hasToken: !!token,
        email: userData?.email,
        name: userData?.name
      });

      if (!token || !userData) {
        return res.status(400).json({ 
          success: false,
          error: "Apple token and user data are required" 
        });
      }

      // Check if this is a demo token (from demo mode)
      const isDemoToken = token && token.startsWith('demo_token_');
      
      if (isDemoToken) {
        console.log(`[Apple Auth - Demo Mode] Email: ${userData.email}, Name: ${userData.name}`);
      } else {
        console.log(`[Apple Auth] Verifying OAuth token...`);
        // In production, you would verify the JWT token with Apple's public keys
      }

      // Extract real user data from OAuth provider
      const appleUserId = userData.id;
      const appleEmail = userData.email;
      const appleName = userData.name;

      // Validate required fields
      if (!appleEmail) {
        return res.status(400).json({ 
          success: false,
          error: "Email is required from OAuth provider" 
        });
      }

      if (!appleName) {
        return res.status(400).json({ 
          success: false,
          error: "Name is required from OAuth provider" 
        });
      }

      // Email verification check (skip for demo mode)
      if (!isDemoToken && userData.email_verified === false) {
        return res.status(403).json({ 
          success: false,
          error: "Please verify your email in Apple account settings" 
        });
      }

      // Create persistent user ID based on OAuth provider ID
      // This ensures the same Apple account always maps to the same user
      const userId = `apple_${appleUserId}`;

      // Check if user already exists (already signed up)
      const existingUser = usersById.get(userId);
      if (existingUser) {
        console.log(`[Apple Auth] ✅ EXISTING USER - Signing in:`, {
          userId,
          email: existingUser.email,
          name: existingUser.name
        });

        // Generate new session token for existing user
        const authToken = btoa(`${userId}:${Date.now()}:${Math.random()}`);

        return res.json({
          success: true,
          token: authToken,
          user: existingUser,  // Return existing user data
          message: "Welcome back! Signed in successfully."
        });
      }

      // NEW USER: Create and store user data
      const newUser = {
        id: userId,
        email: appleEmail,        // ✅ Real Apple email from OAuth
        name: appleName,          // ✅ Real name from OAuth
        provider: 'apple',
        email_verified: userData.email_verified || isDemoToken,
        registered_at: new Date().toISOString()
      };

      // Store user in memory (persist between requests)
      usersById.set(userId, newUser);
      usersByEmail.set(appleEmail, newUser);

      const authToken = btoa(`${userId}:${Date.now()}:${Math.random()}`);

      console.log(`[Apple Auth] ✅ NEW USER - Signed up:`, {
        userId,
        email: appleEmail,
        name: appleName
      });

      return res.json({
        success: true,
        token: authToken,
        user: newUser,
        message: "Account created successfully! Welcome to MarketStock."
      });

    } catch (error) {
      console.error("[Apple Auth] ❌ Error:", error);
      res.status(500).json({ 
        success: false,
        error: "Apple authentication failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // In a real implementation, you might want to invalidate the token
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // 8. Indian Stock Heatmap (Top 25 stocks per sector)
  app.get("/api/india-heatmap", async (req, res) => {
    try {
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

      const sectorData = {};

      // Fetch data for each sector in parallel
      const sectorEntries = await Promise.all(
        Object.entries(INDIAN_SECTORS).map(async ([sectorName, symbols]) => {
          try {
            // Fetch quotes for all stocks in sector
            const quotes = await Promise.all(
              symbols.map(symbol => 
                yahooFinance.quote(symbol)
                  .catch(err => {
                    console.error(`Failed to fetch ${symbol}:`, err.message);
                    return null;
                  })
              )
            );

            // Filter out failed requests and format data
            const stocks = quotes
              .map((quote, idx) => {
                if (!quote) return null;
                
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
              .filter(s => s !== null && s.price > 0)
              .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
              .slice(0, 25); // Top 25 only

            // Calculate sector stats
            const sectorChange = stocks.reduce((sum, s) => sum + s.change, 0) / Math.max(stocks.length, 1);
            const sectorMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);

            return [sectorName, {
              name: sectorName,
              stocks: stocks,
              change: Number(sectorChange.toFixed(2)),
              marketCap: sectorMarketCap,
              gainers: stocks.filter(s => s.change > 0).length,
              losers: stocks.filter(s => s.change < 0).length,
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
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();