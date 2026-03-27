import React from 'react';
import { Newspaper, Clock, ArrowUpRight, Globe, Zap, ChevronDown, TrendingUp, TrendingDown, Lightbulb, AlertCircle, PartyPopper, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

// Mock AI data generation
const generateAISummary = (title: string, summary: string) => {
  const summaries: { [key: string]: string } = {
    inflation: "Central banks may pause rate hikes due to cooling inflation data, potentially benefiting equity markets and reducing borrowing costs.",
    tech: "AI breakthroughs from major tech companies drive stock surges and accelerate digital transformation across industries.",
    crypto: "Crypto assets consolidate as institutional adoption grows, with regulatory clarity aiding market confidence.",
    energy: "Government green energy incentives spark significant rallies in renewable energy stocks.",
  };

  const keyword = title.toLowerCase();
  for (const [key, text] of Object.entries(summaries)) {
    if (keyword.includes(key)) {
      return text;
    }
  }
  return summary.substring(0, 150) + "...";
};

const generateAIInsights = (title: string, category: string) => {
  const insightsByCategory: { [key: string]: string[] } = {
    Markets: [
      "Fed policy shifts may trigger portfolio rebalancing across asset classes",
      "Lower interest rates typically boost valuations for growth-heavy portfolios",
      "Market volatility index suggests cautious positioning despite rallies",
    ],
    Technology: [
      "AI adoption accelerates competitive advantage for large-cap tech firms",
      "Earnings growth expected to outpace sector averages in next quarter",
      "Regulatory scrutiny on AI could impact future revenue growth",
    ],
    Crypto: [
      "Institutional money flow indicators show increasing institutional interest",
      "Bitcoin consolidation pattern often precedes breakout moves",
      "Regulatory developments in key markets could affect volatility",
    ],
    Energy: [
      "Government subsidies improve renewable energy project economics significantly",
      "Clean energy transition creates long-term structural growth tailwinds",
      "Traditional energy stocks may face headwinds from policy shifts",
    ],
  };

  return insightsByCategory[category] || [
    "Market dynamics show evolving investor sentiment",
    "Fundamental factors align with technical indicators",
    "Sector trends suggest continued momentum",
  ];
};

interface AIData {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  impact: { type: 'Bullish' | 'Bearish'; strength: 'Strong' | 'Moderate' | 'Weak' };
  confidence: number; // 0-100
  keyPoints: string[];
  explanation: string;
  prediction: string;
  scenarios: { condition: string; outcome: string }[];
  bullVsBearAnalysis: { bull: string; bear: string };
  relatedAssets: { symbol: string; impact: 'positive' | 'negative' | 'neutral' }[];
  portfolioImpact: { percentage: number; description: string };
  signalQuality: 'High' | 'Medium' | 'Low';
}

const generatePrediction = (title: string, sentiment: 'Positive' | 'Neutral' | 'Negative'): string => {
  const predictions = {
    positive: [
      "Expected uptrend continuation over next 2-4 weeks as positive momentum builds market confidence.",
      "Short-term gains likely as institutional investors reallocate capital toward this sector.",
      "Potential for sector rotation as investor sentiment improves and risk appetite increases.",
    ],
    negative: [
      "Expect consolidation phase as market digests negative implications across related sectors.",
      "Possible further downside before stabilization as risk-off sentiment spreads.",
      "Near-term volatility expected as markets adjust pricing for new fundamental landscape.",
    ],
    neutral: [
      "Sideways movement likely as market assesses longer-term implications of this development.",
      "Catalyst for increased volatility as traders position for multiple possible outcomes.",
      "Consolidation expected while fundamental impact becomes clearer over coming weeks.",
    ],
  };

  const type = sentiment === 'Positive' ? 'positive' : sentiment === 'Negative' ? 'negative' : 'neutral';
  return predictions[type][Math.floor(Math.random() * predictions[type].length)];
};

const generateScenarios = (category: string): { condition: string; outcome: string }[] => {
  const scenariosByCategory: { [key: string]: { condition: string; outcome: string }[] } = {
    Markets: [
      { condition: "If rate cuts accelerate", outcome: "Tech stocks could surge 15-20% as discount rates compress" },
      { condition: "If inflation rebounds", outcome: "Flight-to-safety trades favoring defensive sectors" },
      { condition: "If geopolitical tensions escalate", outcome: "Volatility spikes and safe-haven assets strengthen" },
    ],
    Technology: [
      { condition: "If AI competition intensifies", outcome: "Margins compress but market size expands 3-5x" },
      { condition: "If regulatory scrutiny tightens", outcome: "Growth slows 20-30% near-term, long-term fundamentals intact" },
      { condition: "If adoption accelerates", outcome: "Winner-take-most dynamics, valuations expand materially" },
    ],
    Crypto: [
      { condition: "If institutional adoption increases", outcome: "Bitcoin 3-5x potential as new institutional capital flows in" },
      { condition: "If regulatory clarity emerges", outcome: "Volatility compression and price discovery at higher levels" },
      { condition: "If macro conditions worsen", outcome: "Risk-off sentiment could trigger 30-50% correction" },
    ],
    Energy: [
      { condition: "If energy demand surges", outcome: "Renewable plays 2-3x as green transition accelerates" },
      { condition: "If grid modernization accelerates", outcome: "Equipment suppliers and utilities benefit significantly" },
      { condition: "If subsidies are reversed", outcome: "Project economics deteriorate, growth slows materially" },
    ],
  };

  return scenariosByCategory[category] || [
    { condition: "If market sentiment improves", outcome: "Positive catalyst could drive sector higher" },
    { condition: "If fundamentals deteriorate", outcome: "Downside pressure despite near-term rallies" },
    { condition: "If catalyst extends beyond sector", outcome: "Spillover effects could amplify market moves" },
  ];
};

const generateBullVsBearAnalysis = (title: string, sentiment: 'Positive' | 'Neutral' | 'Negative'): { bull: string; bear: string } => {
  const analyses = {
    Markets: {
      bull: "Lower rates allow multiple expansion in growth assets while improving consumer spending power",
      bear: "Fed pause may signal economic concerns, reducing equity risk appetite and growth outlooks",
    },
    Technology: {
      bull: "AI breakthroughs create multi-decade secular growth opportunity with expanding TAM",
      bear: "Competition intensifies, regulatory risk increases, and valuation stretches beyond historical norms",
    },
    Crypto: {
      bull: "Institutional adoption and regulatory clarity pave way for mainstream integration and 5-10x upside",
      bear: "Regulatory crackdowns, macro headwinds, and tech concentration risks could trigger extended bear markets",
    },
    Energy: {
      bull: "Green energy transition creates structural tailwinds as global ESG investing accelerates",
      bear: "Government policy reversals, battery tech disruption, and commodity cycle downturns pose risks",
    },
  };

  const keyword = title.toLowerCase();
  const category = keyword.includes('market') ? 'Markets' : keyword.includes('tech') ? 'Technology' : keyword.includes('crypto') ? 'Crypto' : 'Energy';

  return analyses[category as keyof typeof analyses] || {
    bull: "Positive catalysts and market sentiment support continued growth trajectory",
    bear: "Valuation concerns and near-term headwinds could pressure prices in short term",
  };
};

const generateRelatedAssets = (category: string): { symbol: string; impact: 'positive' | 'negative' | 'neutral' }[] => {
  const assetsByCategory: { [key: string]: { symbol: string; impact: 'positive' | 'negative' | 'neutral' }[] } = {
    Markets: [
      { symbol: "SPY", impact: "positive" },
      { symbol: "TLT", impact: "positive" },
      { symbol: "SHV", impact: "neutral" },
    ],
    Technology: [
      { symbol: "AAPL", impact: "positive" },
      { symbol: "MSFT", impact: "positive" },
      { symbol: "NVDA", impact: "positive" },
      { symbol: "META", impact: "neutral" },
    ],
    Crypto: [
      { symbol: "BTC-USD", impact: "positive" },
      { symbol: "ETH-USD", impact: "positive" },
      { symbol: "GBTC", impact: "positive" },
    ],
    Energy: [
      { symbol: "ICLN", impact: "positive" },
      { symbol: "TAN", impact: "positive" },
      { symbol: "XLE", impact: "negative" },
    ],
  };

  return assetsByCategory[category] || [
    { symbol: "SPY", impact: "neutral" },
    { symbol: "QQQ", impact: "neutral" },
  ];
};

const generatePortfolioImpact = (isWatchlistNews: boolean, sentiment: 'Positive' | 'Neutral' | 'Negative'): { percentage: number; description: string } => {
  if (!isWatchlistNews) {
    return { percentage: 0, description: "Not directly related to your watchlist" };
  }

  const sentimentImpact = sentiment === 'Positive' ? 2.5 : sentiment === 'Negative' ? -3.2 : 0.8;
  const variance = (Math.random() - 0.5) * 1.5;
  const totalImpact = parseFloat((sentimentImpact + variance).toFixed(1));

  return {
    percentage: totalImpact,
    description: totalImpact > 0 
      ? `Positive news could add ~${totalImpact}% to portfolio value over next 30 days`
      : totalImpact < 0
      ? `Negative sentiment could reduce portfolio value by ~${Math.abs(totalImpact)}% in near term`
      : "Neutral impact on overall portfolio direction",
  };
};

const classifySignalQuality = (sentiment: 'Positive' | 'Neutral' | 'Negative', confidence: number): 'High' | 'Medium' | 'Low' => {
  if (confidence >= 75 && sentiment !== 'Neutral') return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
};

const generateAIData = (title: string, category: string, isWatchlistNews: boolean): AIData => {
  const titleLower = title.toLowerCase();
  
  let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
  if (titleLower.includes('rally') || titleLower.includes('surge') || titleLower.includes('break')) {
    sentiment = 'Positive';
  } else if (titleLower.includes('fall') || titleLower.includes('decline') || titleLower.includes('volatility')) {
    sentiment = 'Negative';
  }

  const baseConfidence = 65 + Math.floor(Math.random() * 30);
  const confidence = isWatchlistNews ? Math.min(baseConfidence + 10, 95) : baseConfidence;

  const impacts: Array<{ type: 'Bullish' | 'Bearish'; strength: 'Strong' | 'Moderate' | 'Weak' }> = [
    { type: 'Bullish', strength: 'Strong' },
    { type: 'Bullish', strength: 'Moderate' },
    { type: 'Bearish', strength: 'Moderate' },
  ];
  let impact = impacts[Math.floor(Math.random() * impacts.length)];
  if (sentiment === 'Positive') impact = { type: 'Bullish', strength: 'Strong' };
  else if (sentiment === 'Negative') impact = { type: 'Bearish', strength: 'Strong' };

  const summary = generateAISummary(title, '');
  const prediction = generatePrediction(title, sentiment);
  const scenarios = generateScenarios(category);
  const bullVsBearAnalysis = generateBullVsBearAnalysis(title, sentiment);
  const relatedAssets = generateRelatedAssets(category);
  const portfolioImpact = generatePortfolioImpact(isWatchlistNews, sentiment);
  const signalQuality = classifySignalQuality(sentiment, confidence);

  return {
    summary,
    sentiment,
    impact: impact as any,
    confidence,
    prediction,
    scenarios,
    bullVsBearAnalysis,
    relatedAssets,
    portfolioImpact,
    signalQuality,
    keyPoints: generateAIInsights(title, category),
    explanation: `This news is significant because it impacts ${category.toLowerCase()} sector performance. ${prediction}`,
  };
};

export const News = () => {
  const { watchlist } = useApp();
  const [newsData, setNewsData] = React.useState<(any & { aiData?: AIData; isWatchlistNews?: boolean })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [aiNewsEnabled, setAiNewsEnabled] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Load AI news enabled state from localStorage
    const saved = localStorage.getItem('aiNewsEnabled');
    if (saved) {
      setAiNewsEnabled(JSON.parse(saved));
    }
  }, []);

  React.useEffect(() => {
    // Persist AI news enabled state to localStorage
    localStorage.setItem('aiNewsEnabled', JSON.stringify(aiNewsEnabled));
  }, [aiNewsEnabled]);

  React.useEffect(() => {
    // Mock news with AI data generation
    const mockNews = [
      {
        id: 1,
        title: "Global Markets Rally as Inflation Data Shows Cooling Trends",
        summary: "Investors are optimistic as the latest consumer price index data suggests that central banks might pause interest rate hikes sooner than expected.",
        source: "Financial Times",
        time: "2h ago",
        category: "Markets",
        image: "https://picsum.photos/seed/market/800/400",
        url: "https://www.ft.com/"
      },
      {
        id: 2,
        title: "Tech Giants Unveil New AI Capabilities, Boosting Sector Performance",
        summary: "Major technology companies have announced breakthrough AI features, leading to a significant surge in their stock prices and overall sector growth.",
        source: "Reuters",
        time: "4h ago",
        category: "Technology",
        image: "https://picsum.photos/seed/tech/800/400",
        url: "https://www.reuters.com/technology/"
      },
      {
        id: 3,
        title: "Crypto Markets Stabilize After Recent Volatility",
        summary: "Bitcoin and Ethereum show signs of consolidation as institutional interest continues to grow despite regulatory uncertainties in some regions.",
        source: "Bloomberg",
        time: "6h ago",
        category: "Crypto",
        image: "https://picsum.photos/seed/crypto/800/400",
        url: "https://www.bloomberg.com/crypto/"
      },
      {
        id: 4,
        title: "Renewable Energy Stocks Surge on New Policy Initiatives",
        summary: "Government incentives for green energy projects have sparked a rally in solar and wind energy stocks across global exchanges.",
        source: "CNBC",
        time: "8h ago",
        category: "Energy",
        image: "https://picsum.photos/seed/energy/800/400",
        url: "https://www.cnbc.com/energy/"
      }
    ];

    // Generate AI data for each article and check watchlist relevance
    const enrichedNews = mockNews.map(item => {
      const isWatchlistNews = 
        (item.category === 'Technology' && watchlist.includes('AAPL')) ||
        (item.category === 'Crypto' && watchlist.includes('BTC-USD')) ||
        (item.category === 'Energy' && watchlist.includes('RELIANCE.NS'));

      return {
        ...item,
        aiData: generateAIData(item.title, item.category, isWatchlistNews),
        isWatchlistNews
      };
    });

    // Prioritize watchlist-related news
    const sorted = enrichedNews.sort((a, b) => {
      if (a.isWatchlistNews && !b.isWatchlistNews) return -1;
      if (!a.isWatchlistNews && b.isWatchlistNews) return 1;
      return 0;
    });

    setNewsData(sorted);
    setLoading(false);
  }, [watchlist]);

  return (
    <div className="p-8 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
            <Newspaper className="w-10 h-10 text-primary" /> Market News
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Stay informed with the latest global financial updates.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-sm">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Updated 5m ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-[500px] bg-white/40 backdrop-blur-md animate-pulse rounded-[3rem] border border-white/40" />
          ))
        ) : (
          newsData.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "glass-card !p-0 overflow-hidden group hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500",
                aiNewsEnabled && item.isWatchlistNews && "ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/20",
                aiNewsEnabled && "animate-in fade-in-50 duration-500"
              )}
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-8 left-8 px-5 py-2 bg-white/90 backdrop-blur-xl rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg">
                  {item.category}
                </div>
                
                {aiNewsEnabled && (
                  <>
                    {item.isWatchlistNews && (
                      <div className="absolute top-8 right-8 px-4 py-2 bg-amber-400/90 backdrop-blur-xl rounded-2xl text-[10px] font-black text-amber-900 uppercase tracking-widest shadow-lg animate-pulse">
                        ⭐ In Watchlist
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.source}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.time}</span>
                  </div>
                  {aiNewsEnabled && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider",
                        item.aiData.sentiment === 'Positive' && "bg-green-100 text-green-700",
                        item.aiData.sentiment === 'Negative' && "bg-red-100 text-red-700",
                        item.aiData.sentiment === 'Neutral' && "bg-slate-100 text-slate-700"
                      )}>
                        {item.aiData.sentiment}
                      </span>
                      <span className="text-[8px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                        {item.aiData.confidence}%
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-primary transition-colors leading-tight tracking-tight">
                  {item.title}
                  {aiNewsEnabled && item.aiData.signalQuality === 'High' && (
                    <span className="ml-2 inline-block text-lg">⚡</span>
                  )}
                </h2>

                {aiNewsEnabled ? (
                  <>
                    <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="flex items-start gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-2">AI Summary</p>
                          <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            {item.aiData.summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Market Impact</p>
                        <div className="flex items-center gap-2">
                          {item.aiData.impact.type === 'Bullish' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                          <span className={cn(
                            "font-black text-sm",
                            item.aiData.impact.type === 'Bullish' ? "text-green-600" : "text-red-600"
                          )}>
                            {item.aiData.impact.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">{item.aiData.impact.strength}</p>
                      </div>

                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className={cn(
                          "p-4 rounded-xl border hover:transition-all text-left",
                          item.aiData.signalQuality === 'High' 
                            ? "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300"
                            : item.aiData.signalQuality === 'Medium'
                            ? "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        )}
                      >
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-widest mb-2",
                          item.aiData.signalQuality === 'High' && "text-green-700",
                          item.aiData.signalQuality === 'Medium' && "text-amber-700",
                          item.aiData.signalQuality === 'Low' && "text-slate-700"
                        )}>Advanced AI Panel</p>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-black",
                            item.aiData.signalQuality === 'High' && "text-green-800",
                            item.aiData.signalQuality === 'Medium' && "text-amber-800",
                            item.aiData.signalQuality === 'Low' && "text-slate-800"
                          )}>
                            {item.aiData.signalQuality}
                          </span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            expandedId === item.id ? "rotate-180" : "",
                            item.aiData.signalQuality === 'High' && "text-green-600",
                            item.aiData.signalQuality === 'Medium' && "text-amber-600",
                            item.aiData.signalQuality === 'Low' && "text-slate-400"
                          )} />
                        </div>
                      </button>
                    </div>

                    {expandedId === item.id && (
                      <div className="mb-8 space-y-6 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        
                        {/* Confidence & Signal Quality */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-2">Confidence Score</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-blue-900">{item.aiData.confidence}%</span>
                              <div className="w-12 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${item.aiData.confidence}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className={cn(
                            "p-4 rounded-xl border flex items-center justify-between",
                            item.aiData.signalQuality === 'High' && "bg-green-50 border-green-200",
                            item.aiData.signalQuality === 'Medium' && "bg-amber-50 border-amber-200",
                            item.aiData.signalQuality === 'Low' && "bg-slate-50 border-slate-200"
                          )}>
                            <div>
                              <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest mb-1",
                                item.aiData.signalQuality === 'High' && "text-green-700",
                                item.aiData.signalQuality === 'Medium' && "text-amber-700",
                                item.aiData.signalQuality === 'Low' && "text-slate-700"
                              )}>Signal Quality</p>
                              <p className={cn(
                                "text-lg font-black",
                                item.aiData.signalQuality === 'High' && "text-green-900",
                                item.aiData.signalQuality === 'Medium' && "text-amber-900",
                                item.aiData.signalQuality === 'Low' && "text-slate-900"
                              )}>{item.aiData.signalQuality}</p>
                            </div>
                            {item.aiData.signalQuality === 'High' && <PartyPopper className="w-6 h-6 text-green-600" />}
                            {item.aiData.signalQuality === 'Medium' && <AlertCircle className="w-6 h-6 text-amber-600" />}
                            {item.aiData.signalQuality === 'Low' && <Shield className="w-6 h-6 text-slate-400" />}
                          </div>
                        </div>

                        {/* Portfolio Impact (if watchlist) */}
                        {item.isWatchlistNews && (
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <p className="text-[9px] font-black text-purple-700 uppercase tracking-widest mb-3">Portfolio Impact</p>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className={cn(
                                "text-3xl font-black",
                                item.aiData.portfolioImpact.percentage > 0 ? "text-green-600" :
                                item.aiData.portfolioImpact.percentage < 0 ? "text-red-600" : "text-slate-700"
                              )}>
                                {item.aiData.portfolioImpact.percentage > 0 ? '+' : ''}{item.aiData.portfolioImpact.percentage}%
                              </span>
                              <span className="text-[10px] text-purple-600 font-semibold">Est. 30-day impact</span>
                            </div>
                            <p className="text-sm text-purple-700 leading-relaxed font-medium">
                              {item.aiData.portfolioImpact.description}
                            </p>
                          </div>
                        )}

                        {/* Prediction */}
                        <div className="p-5 bg-primary/5 rounded-xl border border-primary/20">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">What Happens Next</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {item.aiData.prediction}
                          </p>
                        </div>

                        {/* Bull vs Bear Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Bull Case</p>
                            </div>
                            <p className="text-sm text-green-800 leading-relaxed font-medium">
                              {item.aiData.bullVsBearAnalysis.bull}
                            </p>
                          </div>

                          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingDown className="w-5 h-5 text-red-600" />
                              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Bear Case</p>
                            </div>
                            <p className="text-sm text-red-800 leading-relaxed font-medium">
                              {item.aiData.bullVsBearAnalysis.bear}
                            </p>
                          </div>
                        </div>

                        {/* If/Then Scenarios */}
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">If This Then That</p>
                          <div className="space-y-3">
                            {item.aiData.scenarios.map((scenario, idx) => (
                              <div key={idx} className="flex gap-3 items-start p-3 bg-white rounded-lg border border-slate-100">
                                <div className="flex-1">
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">If: {scenario.condition}</p>
                                  <p className="text-sm text-slate-700 font-medium leading-relaxed">↳ Then: {scenario.outcome}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Related Assets */}
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Hidden Connections (Related Assets)</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {item.aiData.relatedAssets.map((asset, idx) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "p-3 rounded-lg border text-center",
                                  asset.impact === 'positive' && "bg-green-100 border-green-300",
                                  asset.impact === 'negative' && "bg-red-100 border-red-300",
                                  asset.impact === 'neutral' && "bg-slate-100 border-slate-300"
                                )}
                              >
                                <p className={cn(
                                  "text-[11px] font-black uppercase tracking-wider",
                                  asset.impact === 'positive' && "text-green-800",
                                  asset.impact === 'negative' && "text-red-800",
                                  asset.impact === 'neutral' && "text-slate-700"
                                )}>
                                  {asset.symbol}
                                </p>
                                <p className={cn(
                                  "text-[9px] font-semibold mt-1",
                                  asset.impact === 'positive' && "text-green-700",
                                  asset.impact === 'negative' && "text-red-700",
                                  asset.impact === 'neutral' && "text-slate-600"
                                )}>
                                  {asset.impact === 'positive' ? '↑ Positive' : asset.impact === 'negative' ? '↓ Negative' : '→ Neutral'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Points */}
                        <div className="p-5 bg-primary/5 rounded-xl border border-primary/20">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Key Insights</p>
                          <ul className="space-y-3">
                            {item.aiData.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex gap-3 items-start">
                                <span className="text-primary font-black text-lg flex-shrink-0">•</span>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{point}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 text-base leading-relaxed mb-8 font-medium">
                    {item.summary}
                  </p>
                )}

                <button 
                  onClick={() => item.url && window.open(item.url, '_blank')}
                  disabled={!item.url}
                  className={cn(
                    "flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group/btn transition-all",
                    item.url ? "text-slate-900 hover:text-primary cursor-pointer" : "text-slate-300 cursor-not-allowed"
                  )}
                >
                  Read Full Article 
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    item.url ? "bg-slate-100 group-hover/btn:bg-primary group-hover/btn:text-white" : "bg-slate-100"
                  )}>
                    <ArrowUpRight className={cn("w-4 h-4", !item.url && "text-slate-300")} />
                  </div>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <section className={cn(
        "glass-dark rounded-[3rem] p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group transition-all duration-500",
        aiNewsEnabled && "ring-2 ring-amber-400/50 shadow-2xl shadow-amber-400/20"
      )}>
        <div className="max-w-xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Zap className={cn(
              "w-6 h-6 transition-colors",
              aiNewsEnabled ? "text-amber-400 animate-pulse" : "text-amber-400"
            )} />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
              {aiNewsEnabled ? "AI ACTIVE" : "AI Summary"}
            </span>
          </div>
          <h3 className="text-4xl font-black mb-6 tracking-tight">
            {aiNewsEnabled ? "Your AI News Assistant is Active" : "Get the gist, instantly."}
          </h3>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {aiNewsEnabled 
              ? "AI-powered insights are now active. Check news cards for summaries, sentiment analysis, and market impact predictions personalized to your watchlist."
              : "Our AI summarizes thousands of news articles daily to give you the most relevant market insights in seconds."
            }
          </p>
        </div>
        <button 
          onClick={() => setAiNewsEnabled(!aiNewsEnabled)}
          className={cn(
            "btn-primary-glass !px-12 !py-5 !rounded-2xl whitespace-nowrap relative z-10 transition-all duration-300 flex items-center gap-2 group/btn",
            aiNewsEnabled && "!bg-amber-400/20 !border-amber-400/50 !text-amber-400 hover:!bg-amber-400/30"
          )}
        >
          {aiNewsEnabled ? (
            <>
              <Zap className="w-5 h-5 animate-pulse" />
              AI Enabled
            </>
          ) : (
            "Enable AI News"
          )}
        </button>
        <div className={cn(
          "absolute right-0 top-0 w-64 h-64 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:opacity-100 transition-all duration-1000",
          aiNewsEnabled ? "bg-amber-400/20 opacity-100" : "bg-primary/10 opacity-50"
        )} />
      </section>
    </div>
  );
};
