/**
 * Market Intelligence Engine
 * Institutional-grade analysis for price action, setups, and market structure
 */

export interface MarketIntelligence {
  market_state: 'Accumulation' | 'Distribution' | 'Breakout Setup' | 'Breakdown Risk' | 'Trending Up' | 'Trending Down' | 'Neutral';
  institutional_bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: 'Low' | 'Medium' | 'High';
  entry_zone: string;
  invalidation: string;
  target_zone: string;
  reasoning: string;
  market_drivers: {
    trend_strength: string;
    volume_signal: string;
    volatility_state: string;
    momentum: string;
  };
}

/**
 * Analyze market structure for institutional setups
 */
export function analyzeMarketStructure(
  priceChange: number,
  volatility: number,
  volumeRatio: number,
  price: number,
  currency: 'USD' | 'INR' = 'USD'
): MarketIntelligence {
  // Normalize inputs
  const absPriceChange = Math.abs(priceChange);
  const isUptrend = priceChange > 0;
  
  // Determine market state based on price action patterns
  let market_state: MarketIntelligence['market_state'];
  let institutional_bias: MarketIntelligence['institutional_bias'];
  let confidence: MarketIntelligence['confidence'];

  // Volatility state
  const volatilityState = getVolatilityState(volatility);
  
  // Volume signal
  const volumeSignal = getVolumeSignal(volumeRatio, priceChange);
  
  // Trend strength
  const trendStrength = getTrendStrength(absPriceChange);

  // Momentum analysis
  const momentum = getMomentumSignal(priceChange, volatility, volumeRatio);

  // ===== SETUP DETECTION LOGIC =====

  // High volatility expansion + moderate price move = Breakout Setup
  if (volatility > 0.15 && absPriceChange > 1 && volumeRatio > 1.1) {
    market_state = 'Breakout Setup';
    institutional_bias = isUptrend ? 'Bullish' : 'Bearish';
    confidence = 'High';
  }
  // Declining volatility + small moves = Accumulation
  else if (volatility < 0.08 && absPriceChange < 1 && volumeRatio > 1.05) {
    market_state = 'Accumulation';
    institutional_bias = isUptrend ? 'Bullish' : 'Neutral';
    confidence = 'Medium';
  }
  // High volatility + no volume confirmation = Distribution
  else if (volatility > 0.12 && absPriceChange > 1.5 && volumeRatio <= 1.05) {
    market_state = 'Distribution';
    institutional_bias = 'Bearish';
    confidence = 'Medium';
  }
  // Strong downtrend + volume surge = Breakdown Risk
  else if (priceChange < -2 && volumeRatio > 1.2) {
    market_state = 'Breakdown Risk';
    institutional_bias = 'Bearish';
    confidence = 'High';
  }
  // Strong uptrend with volume = Trending Up
  else if (priceChange > 2 && volumeRatio > 1.15) {
    market_state = 'Trending Up';
    institutional_bias = 'Bullish';
    confidence = 'High';
  }
  // Strong downtrend = Trending Down
  else if (priceChange < -2 && volumeRatio > 1.1) {
    market_state = 'Trending Down';
    institutional_bias = 'Bearish';
    confidence = 'High';
  }
  // Medium uptrend indication (price + volume)
  else if (priceChange > 0.7 && volumeRatio > 1.05) {
    market_state = 'Trending Up';
    institutional_bias = 'Bullish';
    confidence = 'Medium';
  }
  // Medium downtrend indication (price + volume)
  else if (priceChange < -0.7 && volumeRatio > 1.05) {
    market_state = 'Trending Down';
    institutional_bias = 'Bearish';
    confidence = 'Medium';
  }
  // Accumulation when prices move sideways with moderate volume
  else if (absPriceChange < 0.5 && volumeRatio > 1.05) {
    market_state = 'Accumulation';
    institutional_bias = 'Neutral';
    confidence = 'Medium';
  }
  // Mild directional bias when price moves and volume is supportive
  else if (priceChange > 0.3) {
    market_state = 'Trending Up';
    institutional_bias = 'Bullish';
    confidence = 'Low';
  } else if (priceChange < -0.3) {
    market_state = 'Trending Down';
    institutional_bias = 'Bearish';
    confidence = 'Low';
  }
  // Default neutral
  else {
    market_state = 'Neutral';
    institutional_bias = 'Neutral';
    confidence = 'Low';
  }

  // ===== CALCULATE ENTRY, TARGET, INVALIDATION =====

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const entry_zone = calculateEntryZone(price, market_state, priceChange, volatility, currencySymbol);
  const target_zone = calculateTargetZone(price, market_state, volatility, priceChange, currencySymbol);
  const invalidation = calculateInvalidation(price, market_state, volatility, currencySymbol);

  // ===== REASONING =====
  const reasoning = generateReasoning(
    market_state,
    institutional_bias,
    trendStrength,
    volumeSignal,
    volatilityState,
    momentum
  );

  return {
    market_state,
    institutional_bias,
    confidence,
    entry_zone,
    invalidation,
    target_zone,
    reasoning,
    market_drivers: {
      trend_strength: trendStrength,
      volume_signal: volumeSignal,
      volatility_state: volatilityState,
      momentum
    }
  };
}

function getVolatilityState(volatility: number): string {
  // Institutional volatility classification for market regime analysis
  if (volatility > 0.20) return 'Extreme volatility - panic/euphoria phase';
  if (volatility > 0.15) return 'High expansion - institutional repositioning';
  if (volatility > 0.10) return 'Elevated - active market structure';
  if (volatility > 0.06) return 'Moderate - normal trading range';
  if (volatility > 0.03) return 'Low - consolidation phase';
  return 'Contracting - institutional accumulation likely';
}

function getVolumeSignal(volumeRatio: number, priceChange: number): string {
  if (volumeRatio > 1.5) {
    return priceChange > 0 ? 'Strong buying pressure' : 'Strong selling pressure';
  }
  if (volumeRatio > 1.2) {
    return priceChange > 0 ? 'Moderate buying' : 'Moderate selling';
  }
  if (volumeRatio > 1.05) {
    return 'Weak volume confirmation';
  }
  return 'Lacking volume support';
}

function getTrendStrength(absPriceChange: number): string {
  if (absPriceChange > 3) return 'Extreme move';
  if (absPriceChange > 2) return 'Strong trend';
  if (absPriceChange > 1) return 'Moderate trend';
  if (absPriceChange > 0.5) return 'Weak momentum';
  return 'Consolidating';
}

function getMomentumSignal(
  priceChange: number,
  volatility: number,
  volumeRatio: number
): string {
  // Institutional momentum assessment combining price, volatility, and volume
  const momentumScore = Math.abs(priceChange) * 0.4 + volatility * 100 * 0.3 + (volumeRatio - 1) * 100 * 0.3;
  
  if (momentumScore > 3) return 'Accelerating with institutional conviction';
  if (momentumScore > 2) return 'Building momentum - structure validated';
  if (momentumScore > 1) return 'Steady momentum - institutional interest';
  if (momentumScore > 0.5) return 'Early momentum forming';
  if (momentumScore > 0.25) return 'Momentum fading - caution advised';
  return 'Momentum exhausted - reversal risk';
}

function calculateEntryZone(
  price: number,
  market_state: string,
  priceChange: number,
  volatility: number,
  currencySymbol: string = '$'
): string {
  const atr = price * volatility; // ATR proxy
  const minEntry = Math.max(price * 0.97, price - atr * 1.5);
  const maxEntry = price;

  if (market_state === 'Accumulation' || market_state === 'Breakout Setup') {
    return `${currencySymbol}${minEntry.toFixed(2)} - ${currencySymbol}${maxEntry.toFixed(2)}`;
  } else if (market_state === 'Breakdown Risk') {
    const supportLevel = price - atr * 2;
    return `Below ${currencySymbol}${supportLevel.toFixed(2)}`;
  }
  
  return `${currencySymbol}${minEntry.toFixed(2)} - ${currencySymbol}${maxEntry.toFixed(2)}`;
}

function calculateTargetZone(
  price: number,
  market_state: string,
  volatility: number,
  priceChange: number,
  currencySymbol: string = '$'
): string {
  const atr = price * volatility;
  const direction = priceChange > 0 ? 1 : -1;

  if (market_state === 'Trending Up' || market_state === 'Breakout Setup') {
    const target1 = price + atr * 2.5;
    const target2 = price + atr * 4;
    return `${currencySymbol}${target1.toFixed(2)} - ${currencySymbol}${target2.toFixed(2)}`;
  } else if (market_state === 'Trending Down' || market_state === 'Breakdown Risk') {
    const target1 = price - atr * 2.5;
    const target2 = price - atr * 4;
    return `${currencySymbol}${target2.toFixed(2)} - ${currencySymbol}${target1.toFixed(2)}`;
  } else if (market_state === 'Accumulation') {
    const breakoutTarget = price + atr * 3;
    return `${currencySymbol}${breakoutTarget.toFixed(2)}+`;
  }

  return `${currencySymbol}${(price + atr).toFixed(2)} - ${currencySymbol}${(price + atr * 2).toFixed(2)}`;
}

function calculateInvalidation(
  price: number,
  market_state: string,
  volatility: number,
  currencySymbol: string = '$'
): string {
  const atr = price * volatility;

  if (market_state === 'Breakout Setup' || market_state === 'Trending Up') {
    const invalidLevel = price - atr * 2;
    return `Below ${currencySymbol}${invalidLevel.toFixed(2)}`;
  } else if (market_state === 'Breakdown Risk' || market_state === 'Trending Down') {
    const invalidLevel = price + atr * 2;
    return `Above ${currencySymbol}${invalidLevel.toFixed(2)}`;
  } else if (market_state === 'Accumulation') {
    const invalidLevel = price - atr * 1.5;
    return `${currencySymbol}${invalidLevel.toFixed(2)}`;
  }

  return `${currencySymbol}${(price - atr * 1.5).toFixed(2)}`;
}

function generateReasoning(
  market_state: string,
  bias: string,
  trend: string,
  volume: string,
  volatility: string,
  momentum: string
): string {
  // Professional, institutional-grade reasoning focused on market structure and price action

  if (market_state === 'Accumulation') {
    return `Institutional accumulation pattern detected. ${trend} with ${volatility} suggests smart money building positions. ${volume} confirms quiet absorption of supply. ${momentum} indicates probability of structure-driven breakout. Risk/reward favorable for qualified breakout trades.`;
  } else if (market_state === 'Distribution') {
    return `Distribution phase underway. ${volatility} with deteriorating ${volume} signals smart money trimming exposure. ${trend} move lacks institutional conviction. ${momentum} failing to hold gains suggests likely reversal or consolidation ahead.`;
  } else if (market_state === 'Breakout Setup') {
    return `Institutional breakout setup identified. ${volatility} expansion with ${volume} validates structure integrity. ${trend} combined with ${momentum} places price near inflection point. Setup has probability-weighted favorable risk/reward for directional traders.`;
  } else if (market_state === 'Breakdown Risk') {
    return `Breakdown structure forms. ${trend} with ${volume} indicates smart money distribution accelerating. ${volatility} elevated combined with deteriorating ${momentum} suggests support invalidation imminent. Caution advised - risk management critical.`;
  } else if (market_state === 'Trending Up') {
    return `Confirmed uptrend structure. ${volume} with ${trend} validates institutional buying interest. ${momentum} still accelerating - higher timeframe bias remains bullish. ${volatility} supports further upside range extension. Consolidations likely represent managed accumulation.`;
  } else if (market_state === 'Trending Down') {
    return `Confirmed downtrend structure. ${volume} validates institutional selling pressure across structure. ${momentum} deteriorating signals acceleration of downside move. ${volatility} expansion shows panic or conviction-driven selling. Support tests probable before stabilization.`;
  }

  return `Market Structure: ${market_state}. Price Action: ${trend}. Buying/Selling Pressure: ${volume}. Market Momentum: ${momentum}. Risk profile indicates ${bias} structural bias.`;
}

/**
 * Get institutional-level AI analysis prompt
 */
export function getInstitutionalAnalysisPrompt(
  symbol: string,
  marketData: {
    price: number;
    priceChange: number;
    volatility: number;
    volumeRatio: number;
  },
  marketIntelligence: MarketIntelligence
): string {
  return `You are an institutional-level market analyst working for a hedge fund. Analyze this market structure:

Asset: ${symbol}
Current Price: ${marketData.price}
24h Change: ${marketData.priceChange.toFixed(2)}%
Volatility: ${(marketData.volatility * 100).toFixed(1)}%
Volume Ratio: ${marketData.volumeRatio.toFixed(2)}x

Market Structure Analysis:
- State: ${marketIntelligence.market_state}
- Bias: ${marketIntelligence.institutional_bias}
- Entry Zone: ${marketIntelligence.entry_zone}
- Target Zone: ${marketIntelligence.target_zone}
- Invalidation: ${marketIntelligence.invalidation}

Your task:
1. Validate if this setup is legitimate (not forced)
2. Identify the key probability-weighted outcome
3. Explain the market structure using price action, not predictions
4. Do NOT guess exact prices or use speculation
5. Focus on level and structure

Respond with ONLY valid JSON:
{
  "setup_valid": true|false,
  "primary_scenario": "brief setup description",
  "probability_bias": "bullish|bearish|neutral",
  "key_level": "important price or range",
  "structure_comment": "professional explanation of market structure"
}`;
}
