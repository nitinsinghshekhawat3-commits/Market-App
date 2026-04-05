import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeAsset(symbol: string, data: any) {
  try {
    const prompt = `Analyze the following asset: ${symbol}. 
    Name: ${data.name}
    Current Price: ${data.price}
    Change: ${data.change}%
    Market Cap: ${data.marketCap}
    Volume: ${data.volume}
    Business Summary: ${data.summary || 'N/A'}
    
    Provide a professional financial analysis in JSON format. Be insightful and consider market trends.
    {
      "trend": "Bullish" | "Bearish" | "Neutral",
      "riskScore": "Low" | "Medium" | "High",
      "aiScore": number (0-100),
      "summary": "string (insightful explanation of current performance and future outlook)",
      "suggestion": "Buy" | "Hold" | "Sell",
      "pros": ["string"],
      "cons": ["string"],
      "futurePlans": "string (detailed future outlook and company strategy)"
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      trend: "Neutral",
      riskScore: "Medium",
      aiScore: 50,
      summary: "AI analysis currently unavailable. Please check back later.",
      suggestion: "Hold",
      pros: ["Historical stability"],
      cons: ["Market volatility"],
      futurePlans: "Information not available."
    };
  }
}

export async function simulateScenario(symbol: string, currentPrice: number, scenario: string) {
  try {
    const prompt = `Simulate a hypothetical financial scenario for ${symbol}.
    Current Price: ${currentPrice}
    Scenario: ${scenario}
    
    Provide a detailed simulation in JSON format. Generate 30 days of realistic simulated price points starting from the current price.
    {
      "estimatedValue": number,
      "riskImpact": "Low" | "Medium" | "High",
      "explanation": "string (detailed explanation of why this outcome is likely)",
      "bestCase": "string (best outcome)",
      "worstCase": "string (worst outcome)",
      "projectionData": [
        {"day": number, "value": number} 
      ]
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("AI Simulation Error:", error);
    return null;
  }
}

export async function explainChart(symbol: string, chartData: any[]) {
  try {
    const prompt = `Explain the following chart data for ${symbol} in simple terms for a beginner.
    Chart Data (last 30 points): ${JSON.stringify(chartData.slice(-30))}
    
    Analyze:
    1. Trend direction (Upward, Downward, Sideways)
    2. Support and Resistance levels
    3. Volume patterns (if available)
    
    Provide the explanation in JSON format:
    {
      "explanation": "string (simple explanation of what's happening)",
      "insight": "string (trading insight or what to watch for)",
      "riskWarning": "string (specific risk warning for this pattern)",
      "trend": "string (Upward | Downward | Sideways)"
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("AI Chart Explanation Error:", error);
    return null;
  }
}

export async function getGlobalSentiment(marketData: any[]) {
  try {
    const prompt = `Analyze the global financial market sentiment based on the following data for major indices and their recent news:
    ${JSON.stringify(marketData)}
    
    For each country, provide:
    1. Sentiment Score (0-100)
    2. Label (Bullish, Bearish, Neutral)
    3. AI Summary (brief explanation of current mood)
    
    Also provide overall global insights:
    1. Most Bullish Country
    2. Most Bearish Country
    3. Overall Global Sentiment Score (0-100)
    
    Return the response in JSON format:
    {
      "countries": [
        {
          "country": "string",
          "sentimentScore": number,
          "label": "Bullish" | "Bearish" | "Neutral",
          "summary": "string"
        }
      ],
      "global": {
        "mostBullish": "string",
        "mostBearish": "string",
        "overallScore": number
      }
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("Global Sentiment AI Error:", error);
    return null;
  }
}
