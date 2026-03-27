// Vercel serverless function for AI analysis
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

export default async function handler(req, res) {
  setCORS(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        model: 'llama-3.3-70b-versatile',
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
}
