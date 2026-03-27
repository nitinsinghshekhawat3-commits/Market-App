/**
 * AI Service using Groq API (Free Tier)
 * Groq provides free API with generous limits
 * Get free API key: https://console.groq.com/keys
 */

const GROQ_API_KEY = (process.env.VITE_GROQ_API_KEY || '') as string;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(prompt: string): Promise<string> {
  try {
    if (!GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return '';
    }

    console.log('🔄 Calling Groq API...');

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 0.95,
        stream: false,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, response.statusText, errorText);
      return '';
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    if (!content) {
      console.error('❌ No content in Groq response:', data);
      return '';
    }

    console.log('✅ Groq API success:', content.substring(0, 150) + '...');
    return content;
  } catch (error) {
    console.error('❌ Groq API fetch error:', error);
    return '';
  }
}

export async function analyzeAsset(symbol: string, data: any, currency: 'USD' | 'INR' = 'USD') {
  try {
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const prompt = `You are an expert financial analyst with deep expertise in market dynamics, technical analysis, and fundamental research. Analyze the following asset with institutional-grade insights:

Asset: ${symbol}
Company: ${data.name}
Current Price: ${currencySymbol}${data.price}
24h Change: ${data.change}%
Market Cap: ${currencySymbol}${data.marketCap}
Trading Volume: ${data.volume}
Business Profile: ${data.summary || 'Financial instrument'}

Provide a comprehensive professional analysis considering:
1. Current market sentiment and price momentum
2. Risk/reward assessment with technical levels
3. Institutional activity patterns
4. Sector trends and macro factors
5. 3-6 month outlook

RESPOND ONLY WITH VALID JSON (no markdown, no code blocks):
{
  "trend": "Bullish|Bearish|Neutral",
  "riskScore": "Low|Medium|High",
  "aiScore": <number 0-100>,
  "summary": "<detailed 2-3 sentence analysis of current state and future trajectory>",
  "suggestion": "Buy|Hold|Sell",
  "pros": ["<benefit 1>", "<benefit 2>", "<benefit 3>"],
  "cons": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "futurePlans": "<detailed outlook with specific factors and timeline>"
}`;

    const text = await callGroqAPI(prompt);

    if (text) {
      try {
        // Extract JSON even if there's extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Asset Analysis Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Parse error, using fallback:', e);
        return getDefaultAnalysis();
      }
    }

    return getDefaultAnalysis();
  } catch (error) {
    console.error('Asset Analysis Error:', error);
    return getDefaultAnalysis();
  }
}

export async function explainChart(symbol: string, chartData: any[], currency: 'USD' | 'INR' = 'USD') {
  try {
    if (!chartData || chartData.length === 0) return getDefaultChartExplanation();

    const currencySymbol = currency === 'INR' ? '₹' : '$';

    // Calculate technical indicators
    const closes = chartData.map(d => d.close).filter(v => v > 0);
    const opens = chartData.map(d => d.open).filter(v => v > 0);
    const highs = chartData.map(d => d.high).filter(v => v > 0);
    const lows = chartData.map(d => d.low).filter(v => v > 0);

    const currentClose = closes[closes.length - 1];
    const previousClose = closes[0];
    const priceChange = ((currentClose - previousClose) / previousClose) * 100;
    const highPrice = Math.max(...highs);
    const lowPrice = Math.min(...lows);
    const support = lowPrice;
    const resistance = highPrice;

    const prompt = `As a technical analysis expert, provide professional trading insights for ${symbol}.

CHART TECHNICAL DATA:
- Current Price: ${currencySymbol}${currentClose.toFixed(2)}
- 30-Day Change: ${priceChange.toFixed(2)}%
- Support Level: ${currencySymbol}${support.toFixed(2)}
- Resistance Level: ${currencySymbol}${resistance.toFixed(2)}
- High: ${currencySymbol}${highPrice.toFixed(2)}
- Low: ${currencySymbol}${lowPrice.toFixed(2)}
- Data Points: ${chartData.length}

Analyze the technical setup considering:
1. Trend structure and momentum
2. Support/resistance zones and breakout levels
3. Entry/exit signals for traders
4. Risk management levels
5. Probability of continuation vs reversal

RESPOND ONLY WITH VALID JSON (no markdown):
{
  "explanation": "<detailed technical analysis of price action and trends>",
  "insight": "<specific trading opportunity or signal for next 1-2 weeks>",
  "riskWarning": "<critical risk level to watch and recommended stop loss>",
  "trend": "Upward|Downward|Sideways"
}`;

    const text = await callGroqAPI(prompt);

    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Chart Explanation Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Chart parse error, using fallback:', e);
        return getDefaultChartExplanation();
      }
    }

    return getDefaultChartExplanation();
  } catch (error) {
    console.error('Chart Explanation Error:', error);
    return getDefaultChartExplanation();
  }
}

export async function simulateScenario(symbol: string, currentPrice: number, scenario: string, currency: 'USD' | 'INR' = 'USD') {
  try {
    if (!symbol || !currentPrice || !scenario) {
      console.warn('Missing parameters for simulation');
      return null;
    }

    const currencySymbol = currency === 'INR' ? '₹' : '$';

    const scenarioDescriptions = {
      bullish: 'strong uptrend with institutional buying pressure',
      bearish: 'downtrend with increasing selling pressure',
      sideways: 'consolidation range with equilibrium'
    };

    const prompt = `As a quantitative trading analyst, simulate a realistic 30-day price scenario for ${symbol}.

Current Price: ${currencySymbol}${currentPrice.toFixed(2)}
Scenario Type: ${scenario.toUpperCase()} (${scenarioDescriptions[scenario as keyof typeof scenarioDescriptions] || 'unknown'})

Generate a detailed scenario considering:
1. Historical volatility patterns
2. Realistic price targets based on technical levels
3. Probability-weighted outcomes
4. Key support/resistance zones
5. Timeframe and risk/reward ratio

Provide 7 realistic checkpoint values over 30 days (days 1, 5, 10, 15, 20, 25, 30).

RESPOND ONLY WITH VALID JSON (no markdown):
{
  "estimatedValue": <price at day 30>,
  "riskImpact": "Low|Medium|High",
  "explanation": "<why this scenario is realistic based on technical and market factors>",
  "bestCase": "<optimistic outcome with specific price target>",
  "worstCase": "<pessimistic outcome with downside target>",
  "projectionData": [
    {"day": 1, "value": ${currentPrice}},
    {"day": 5, "value": <realistic price>},
    {"day": 10, "value": <realistic price>},
    {"day": 15, "value": <realistic price>},
    {"day": 20, "value": <realistic price>},
    {"day": 25, "value": <realistic price>},
    {"day": 30, "value": <realistic price>}
  ]
}`;

    console.log('🔄 Calling Scenario API...');
    const text = await callGroqAPI(prompt);
    
    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Scenario Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Scenario parse error:', e, 'Response:', text.substring(0, 200));
        return null;
      }
    }

    console.warn('❌ No response from Scenario API');
    return null;
  } catch (error) {
    console.error('❌ Scenario Simulation Error:', error);
    return null;
  }
}

export async function getGlobalSentiment(marketData: any[]) {
  try {
    if (!marketData || marketData.length === 0) {
      return getDefaultSentiment();
    }

    const dataString = JSON.stringify(marketData.slice(0, 10));
    
    const prompt = `As a global markets strategist, analyze market sentiment across major economies.

Market Data from Key Indices:
${dataString}

Provide a professional geopolitical and macroeconomic assessment:
1. Sentiment in major developed markets (US, Europe, Japan)
2. Emerging markets sentiment (India, China, etc)
3. Risk factors influencing each region
4. Cross-border capital flows and correlations
5. Next 2-4 weeks outlook for each region

Score sentiment from 0-100 (0=very bearish, 50=neutral, 100=very bullish)

RESPOND ONLY WITH VALID JSON (no markdown):
{
  "countries": [
    {
      "country": "<country name>",
      "sentimentScore": <0-100>,
      "label": "Bullish|Bearish|Neutral",
      "summary": "<detailed assessment of market mood and key drivers>"
    }
  ],
  "global": {
    "mostBullish": "<strongest performing region>",
    "mostBearish": "<weakest performing region>",
    "overallScore": <0-100>,
    "globalOutlook": "<macro assessment of global markets>"
  }
}`;

    const text = await callGroqAPI(prompt);

    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Global Sentiment Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Sentiment parse error:', e);
        return getDefaultSentiment();
      }
    }

    return getDefaultSentiment();
  } catch (error) {
    console.error('Global Sentiment Error:', error);
    return getDefaultSentiment();
  }
}

// Fallback responses when API is unavailable
function getDefaultAnalysis() {
  return {
    trend: 'Neutral',
    riskScore: 'Medium',
    aiScore: 60,
    summary: 'Asset is trading in neutral territory with balanced supply and demand. Consider monitoring key technical levels for directional signals. Market sentiment suggests a consolidation phase with potential breakout coming.',
    suggestion: 'Hold',
    pros: ['Established market presence with institutional support', 'Reasonable trading volume and liquidity', 'Clear support levels for risk management'],
    cons: ['Near-term volatility uncertainty', 'Macro headwinds affecting broader market', 'Limited near-term catalysts'],
    futurePlans: 'Monitor for breakout above resistance with volume confirmation. Key price targets at 5-10% moves either direction. 2-4 week consolidation expected before significant move.'
  };
}

function getDefaultChartExplanation() {
  return {
    explanation: 'The chart shows consolidation pattern with price equilibrium between buyers and sellers. Multiple tests of key levels indicate strong support/resistance zones. Technical structure suggests neutral bias with equal probability of breakout in either direction.',
    insight: 'Watch for volume-confirmed breakout above resistance or breakdown below support. Best entry opportunities emerge after consolidation breaks. Consider waiting for clear directional signal with volume confirmation before entering new positions.',
    riskWarning: 'Set stop loss 3-5% below nearest support level. Risk/reward on breakout plays should be minimum 1:2 ratio. Consolidation can break unexpectedly in either direction on low volume spikes - monitor closely.',
    trend: 'Sideways'
  };
}

function getDefaultSentiment() {
  return {
    countries: [
      {
        country: 'USA',
        sentimentScore: 70,
        label: 'Bullish',
        summary: 'Strong institutional buying pressure with positive momentum. Tech sector leadership supporting broader market. Near-term resistance at key technical levels showing consolidation before higher prices.'
      },
      {
        country: 'India',
        sentimentScore: 75,
        label: 'Bullish',
        summary: 'Growing market activity and strong retail investor participation. Banking sector performance supporting indices. Foreign direct investment inflows showing confidence in growth narrative.'
      },
      {
        country: 'Europe',
        sentimentScore: 55,
        label: 'Neutral',
        summary: 'Mixed signals with economic data showing divergence. Banking sector weakness offset by industrial strength. Cautious outlook on rate policy impacts near-term.'
      }
    ],
    global: {
      mostBullish: 'USA',
      mostBearish: 'Europe',
      overallScore: 67,
      globalOutlook: 'Risk-on sentiment with selective market participation. Developed markets leading while emerging markets showing consolidation. Key macro event risk present.'
    }
  };
}