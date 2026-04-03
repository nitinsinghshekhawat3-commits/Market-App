# Market-App
AI-powered financial intelligence platform with real-time market data, advanced charts, and institutional-grade insights.

## Run Locally

**Prerequisites:** Node.js 22+ and npm 10+

1. Install dependencies:
   `npm install`
2. Create `.env` or `.env.local` with required API keys (GROQ_API_KEY, GROQ_MODEL, etc.)
3. Run:
   `npm run dev`

## Deploy to Vercel

1. Set Vercel project to use the root directory.
2. Verify `buildCommand` is `npm run build` and `outputDirectory` is `dist`.
3. Add environment variables in Vercel (GROQ_API_KEY, GROQ_MODEL, etc.).
4. Push to GitHub and redeploy.

