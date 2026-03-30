export interface ScenarioData {
  scenario: 'bullish' | 'bearish' | 'sideways';
  priceTarget: number;
  probability: number;
  reasoning: string;
  marketDrivers: string;
  keyRisk: string;
  outlook: string;
}

export interface SimulationResult {
  asset: string;
  symbol: string;
  currentPrice: number;
  scenarios: ScenarioData[];
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

// Calculate volatility based on price changes
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.1; // Default 10% if not enough data

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Calculate standard deviation (volatility)
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

// Detect current trend based on price change and volume
export function detectTrend(
  priceChangePercent: number,
  volumeRatio: number
): 'bullish' | 'bearish' | 'neutral' {
  // Strong move (>1%) with good volume (>1.1x) = clear trend
  if (Math.abs(priceChangePercent) > 1 && volumeRatio > 1.1) {
    return priceChangePercent > 0 ? 'bullish' : 'bearish';
  }
  
  // Very strong move (>2%) even without volume confirmation = trend
  if (Math.abs(priceChangePercent) > 2) {
    return priceChangePercent > 0 ? 'bullish' : 'bearish';
  }
  
  // Moderate move (0.5-1%) with volume = weak trend
  if (Math.abs(priceChangePercent) > 0.5 && volumeRatio > 1.15) {
    return priceChangePercent > 0 ? 'bullish' : 'bearish';
  }
  
  // Everything else is neutral
  return 'neutral';
}

// Generate scenario probabilities based on trend and volatility
export function generateScenarioProbabilities(
  priceChangePercent: number,
  volatility: number
): { bullish: number; bearish: number; sideways: number } {
  let bullish: number;
  let bearish: number;
  let sideways: number;

  // Base probabilities: neutral = 30%
  if (priceChangePercent > 2) {
    // Strong bullish trend
    bullish = Math.min(60, 40 + Math.abs(priceChangePercent) * 5);
    bearish = Math.max(10, 25 - Math.abs(priceChangePercent) * 3);
    sideways = 100 - bullish - bearish;
  } else if (priceChangePercent < -2) {
    // Strong bearish trend
    bearish = Math.min(60, 40 + Math.abs(priceChangePercent) * 5);
    bullish = Math.max(10, 25 - Math.abs(priceChangePercent) * 3);
    sideways = 100 - bullish - bearish;
  } else {
    // Weak or neutral trend
    const volatilityFactor = Math.min(20, volatility * 100);
    bullish = 35 + (priceChangePercent > 0 ? 10 : 0);
    bearish = 35 - (priceChangePercent > 0 ? 10 : 0);
    sideways = 30;
  }

  // Normalize to ensure sum = 100
  const total = bullish + bearish + sideways;
  return {
    bullish: Math.round((bullish / total) * 100),
    bearish: Math.round((bearish / total) * 100),
    sideways: Math.round(((sideways / total) * 100) * 100) / 100 // Provide two decimals
  };
}

// Calculate price targets based on volatility and current price
export function calculatePriceTargets(
  currentPrice: number,
  volatility: number,
  priceChangePercent: number
): { bullish: number; bearish: number; sideways: number } {
  // Use volatility to determine price range
  const bullishMove = currentPrice * (0.05 + volatility * 0.8); // 5% + volatility factor
  const bearishMove = currentPrice * (0.05 + volatility * 0.8);

  // Adjust based on current trend
  const trendFactor = 1 + priceChangePercent / 100;

  return {
    bullish: Number((currentPrice + bullishMove * trendFactor).toFixed(2)),
    bearish: Number((currentPrice - bearishMove * trendFactor).toFixed(2)),
    sideways: Number((currentPrice * trendFactor).toFixed(2))
  };
}

// Main function to generate scenarios with AI enhancement
export async function generateScenarios(
  symbol: string,
  type: 'stock' | 'crypto',
  priceChange: number,
  volatility: number
): Promise<ScenarioData[]> {
  // Ensure volatility is reasonable
  const normalizedVolatility = Math.min(Math.max(volatility, 0.01), 0.5);

  // Calculate probabilities
  const probs = generateScenarioProbabilities(priceChange, normalizedVolatility);

  // Create reasoning based on trend and volatility
  const trend = detectTrend(priceChange, 1.2);
  const volatilityPercent = Math.round(normalizedVolatility * 100);

  // AI Enhancement: Get detailed professional insights
  try {
    const aiInsights = await getAIEnhancedInsights(symbol, priceChange, volatilityPercent);
    
    return [
      {
        scenario: 'bullish',
        priceTarget: 0, // Will be set in component
        probability: probs.bullish,
        reasoning: aiInsights.bullish.reasoning,
        marketDrivers: aiInsights.bullish.marketDrivers,
        keyRisk: aiInsights.bullish.keyRisk,
        outlook: aiInsights.bullish.outlook
      },
      {
        scenario: 'bearish',
        priceTarget: 0, // Will be set in component
        probability: probs.bearish,
        reasoning: aiInsights.bearish.reasoning,
        marketDrivers: aiInsights.bearish.marketDrivers,
        keyRisk: aiInsights.bearish.keyRisk,
        outlook: aiInsights.bearish.outlook
      },
      {
        scenario: 'sideways',
        priceTarget: 0, // Will be set in component
        probability: probs.sideways,
        reasoning: aiInsights.sideways.reasoning,
        marketDrivers: aiInsights.sideways.marketDrivers,
        keyRisk: aiInsights.sideways.keyRisk,
        outlook: aiInsights.sideways.outlook
      }
    ];
  } catch (error) {
    console.warn('AI enhancement failed, using fallback:', error);
    // Fallback to structured defaults
    return [
      {
        scenario: 'bullish',
        priceTarget: 0,
        probability: probs.bullish,
        reasoning: 'Positive price momentum with technical strength.',
        marketDrivers: 'Upward momentum supported by increasing volume and positive trend continuation.',
        keyRisk: 'Resistance level could cap upside if rejected.',
        outlook: 'Short-term bullish continuation likely unless resistance is violated.'
      },
      {
        scenario: 'bearish',
        priceTarget: 0,
        probability: probs.bearish,
        reasoning: 'Downward pressure with technical weakness observed.',
        marketDrivers: 'Declining momentum with volume support suggesting selling pressure.',
        keyRisk: 'Support breakdown could accelerate downside move.',
        outlook: 'Short-term bearish bias likely if support fails to hold.'
      },
      {
        scenario: 'sideways',
        priceTarget: 0,
        probability: probs.sideways,
        reasoning: 'Consolidation pattern with balanced market structure.',
        marketDrivers: 'Equilibrium between buyers and sellers with stable volume.',
        keyRisk: 'Unexpected breakout could occur without warning.',
        outlook: 'Price likely to oscillate within established range until directional catalyst appears.'
      }
    ];
  }
}

/**
 * Get AI-enhanced professional insights for each scenario
 */
async function getAIEnhancedInsights(
  symbol: string,
  priceChange: number,
  volatilityPercent: number
): Promise<{
  bullish: { reasoning: string; marketDrivers: string; keyRisk: string; outlook: string };
  bearish: { reasoning: string; marketDrivers: string; keyRisk: string; outlook: string };
  sideways: { reasoning: string; marketDrivers: string; keyRisk: string; outlook: string };
}> {
  const GROQ_API_KEY = (process.env.VITE_GROQ_API_KEY || '') as string;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const prompt = `You are a professional financial analyst. Provide structured, data-driven insights for ${symbol}.

Market Context:
- Price Change: ${priceChange.toFixed(2)}%
- Volatility: ${volatilityPercent}%

For each scenario (bullish, bearish, sideways), provide:
1. Reasoning: Why price may move in this direction
2. Market Drivers: Explain using trend, volume, volatility, and momentum (2-3 lines max)
3. Key Risk: Primary downside risk for this scenario (1 line max)
4. Outlook: Short-term perspective (1 line max)

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "bullish": {
    "reasoning": "detailed reasoning",
    "marketDrivers": "upward momentum supported by...",
    "keyRisk": "resistance could cap upside...",
    "outlook": "short-term bullish..."
  },
  "bearish": {
    "reasoning": "detailed reasoning",
    "marketDrivers": "declining momentum with...",
    "keyRisk": "support breakdown could...",
    "outlook": "short-term bearish..."
  },
  "sideways": {
    "reasoning": "detailed reasoning",
    "marketDrivers": "equilibrium between...",
    "keyRisk": "unexpected breakout could...",
    "outlook": "price likely to oscillate..."
  }
}`;

  try {
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
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false,
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('No JSON found in response');
  } catch (error) {
    console.warn('AI insights fetch failed:', error);
    throw error;
  }
}
