/**
 * AI Service (client-side wrapper calling backend AI endpoint)
 * Backend endpoint is /api/ai and uses server-side GROQ_API_KEY.
 */

let aiCallCounter = 0;
let aiWindowStart = Date.now();
const MAX_AI_CALLS_PER_MINUTE = 20;
let aiDisabledUntil = 0;

async function callGroqAPI(prompt: string): Promise<string> {
  try {
    const now = Date.now();
    if (now < aiDisabledUntil) {
      console.warn('AI requests temporarily disabled until', new Date(aiDisabledUntil).toLocaleTimeString());
      return '';
    }

    if (now - aiWindowStart > 60000) {
      aiWindowStart = now;
      aiCallCounter = 0;
    }

    if (aiCallCounter >= MAX_AI_CALLS_PER_MINUTE) {
      aiDisabledUntil = now + 60000;
      console.warn('AI rate limit reached; pausing requests for 60s');
      return '';
    }

    aiCallCounter += 1;

    console.log('🔄 Calling local AI endpoint /api/ai ...');

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Local AI endpoint error:', response.status, response.statusText, errorText);
      if (response.status === 429) {
        aiDisabledUntil = Date.now() + 60000;
        console.warn('Too many requests, throttling AI for 60 seconds');
      }
      return '';
    }

    const data = await response.json();
    const content = data.text || data.analysis || '';

    if (!content) {
      console.error('❌ No content in /api/ai response:', data);
      return '';
    }

    console.log('✅ /api/ai success:', content.substring(0, 150) + '...');
    return content;
  } catch (error) {
    console.error('❌ /api/ai fetch error:', error);
    if (error instanceof Error && /429|Too Many Requests/i.test(error.message)) {
      aiDisabledUntil = Date.now() + 60000;
    }
    return '';
  }
}

export async function analyzeAsset(symbol: string, data: any, currency: 'USD' | 'INR' = 'USD') {
  try {
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const prompt = `Analyze this financial asset and provide a professional assessment.

ASSET DETAILS:
- Symbol: ${symbol}
- Name: ${data.name}
- Current Price: ${currencySymbol}${data.price}
- 24h Change: ${data.change}%
- Market Cap: ${currencySymbol}${data.marketCap}
- Volume: ${data.volume}

REQUIRED: Respond with ONLY a valid JSON object in this exact format:
{
  "trend": "Bullish|Bearish|Neutral",
  "riskScore": "Low|Medium|High", 
  "aiScore": 0-100,
  "summary": "2-3 sentence analysis",
  "suggestion": "Buy|Hold|Sell",
  "pros": ["benefit 1", "benefit 2", "benefit 3"],
  "cons": ["risk 1", "risk 2", "risk 3"],
  "futurePlans": "outlook and timeline"
}`;

    const text = await callGroqAPI(prompt);

    if (text) {
      try {
        // Extract JSON even if there's extra text - look for the first complete JSON object
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Asset Analysis Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Parse error, trying alternative parsing:', e);
        // Try to find JSON between triple backticks if present
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            const parsed = JSON.parse(codeBlockMatch[1]);
            console.log('✅ Asset Analysis Response (from code block):', parsed);
            return parsed;
          } catch (e2) {
            console.warn('Code block parse error:', e2);
          }
        }
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

    const prompt = `Analyze this price chart for ${symbol}.

TECHNICAL DATA:
- Current Price: ${currencySymbol}${currentClose.toFixed(2)}
- 30-Day Change: ${priceChange.toFixed(2)}%
- Support: ${currencySymbol}${support.toFixed(2)}
- Resistance: ${currencySymbol}${resistance.toFixed(2)}
- Data Points: ${chartData.length}

REQUIRED: Respond with ONLY a valid JSON object:
{
  "explanation": "technical analysis of price action",
  "insight": "specific trading opportunity for next 1-2 weeks", 
  "riskWarning": "critical risk level and stop loss",
  "trend": "Upward|Downward|Sideways"
}`;

    const text = await callGroqAPI(prompt);

    if (text) {
      try {
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Chart Explanation Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Chart parse error, trying alternative parsing:', e);
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            const parsed = JSON.parse(codeBlockMatch[1]);
            console.log('✅ Chart Explanation Response (from code block):', parsed);
            return parsed;
          } catch (e2) {
            console.warn('Code block parse error:', e2);
          }
        }
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

    const prompt = `Generate a 30-day price scenario for ${symbol}.

Current Price: ${currencySymbol}${currentPrice.toFixed(2)}
Scenario: ${scenario.toUpperCase()} (${scenarioDescriptions[scenario as keyof typeof scenarioDescriptions]})

REQUIRED: Respond with ONLY a valid JSON object:
{
  "estimatedValue": 30,
  "riskImpact": "Low|Medium|High",
  "explanation": "why this scenario is realistic",
  "bestCase": "optimistic outcome with price target",
  "worstCase": "pessimistic outcome with price target",
  "projectionData": [
    {"day": 1, "value": ${currentPrice}},
    {"day": 5, "value": 0},
    {"day": 10, "value": 0},
    {"day": 15, "value": 0},
    {"day": 20, "value": 0},
    {"day": 25, "value": 0},
    {"day": 30, "value": 0}
  ]
}`;

    console.log('🔄 Calling Scenario API...');
    const text = await callGroqAPI(prompt);
    
    if (text) {
      try {
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Scenario Response:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Scenario parse error, trying alternative parsing:', e);
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            const parsed = JSON.parse(codeBlockMatch[1]);
            console.log('✅ Scenario Response (from code block):', parsed);
            return parsed;
          } catch (e2) {
            console.warn('Code block parse error:', e2);
          }
        }
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