// ... ALL YOUR ORIGINAL IMPORTS (UNCHANGED)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PriceChart } from '../components/PriceChart';
import { analyzeAsset, explainChart } from '../services/aiService';
import { formatCurrency, formatCompactNumber, cn } from '../lib/utils';
import { getCompanyLogoUrl } from '../lib/logoMap';
import { TrendingUp, TrendingDown, Shield, Zap, BarChart2, Info, Star, Check, Plus, MessageSquare, AlertTriangle, Lightbulb, Loader2, BrainCircuit, ChevronDown } from 'lucide-react';

export const AssetDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { currency, fxRate, watchlist, addToWatchlist, removeFromWatchlist, isPro } = useApp();
  const [data, setData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chartExplanation, setChartExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [explainingChart, setExplainingChart] = useState(false);
  const [fallbackLogoUrl, setFallbackLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '1Y' | '5Y'>('1Y');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'bar' | 'smart-trend'>('candlestick');
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);

  const isWatched = watchlist.includes(symbol || '');

  // 🔽 ORIGINAL useEffect (UNCHANGED)
  useEffect(() => {
    // Clear previous stock analysis state when symbol changes
    setData(null);
    setAnalysis(null);
    setChartExplanation(null);
    setSelectedPeriod('1Y');
    setChartType('candlestick');
    setFallbackLogoUrl(null);
    setLogoError(false);
    setAnalyzing(false);
    setExplainingChart(false);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/stocks/${symbol}`);
        const d = await res.json();
        setData(d);
        setLoading(false);

        if (!d.quote.logoUrl) {
          const url = await getCompanyLogoUrl(symbol || '');
          if (url) {
            setFallbackLogoUrl(url);
          }
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  // ... REST OF YOUR FILE EXACTLY SAME (NO CHANGE)


  const logoUrl = data?.quote?.logoUrl || fallbackLogoUrl;

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl" />
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    </div>
  );

  if (!data) return <div className="p-8 text-center">Asset not found.</div>;

  const { quote, history } = data;
  const isPositive = quote.regularMarketChangePercent >= 0;
  const isINR = quote.currency === 'INR' || symbol?.endsWith('.NS') || symbol?.endsWith('.BO');
  
  // yahoo-finance2 v3 returns history.quotes directly
  const quotes = history?.quotes || history?.result?.[0]?.quotes || [];
  
  const allChartData = quotes.map((q: any) => ({
    time: new Date(q.date).toISOString().split('T')[0],
    open: q.open || q.close || 0,
    high: q.high || q.close || 0,
    low: q.low || q.close || 0,
    close: q.close || 0
  }))
  .filter((q: any) => q.close !== 0)
  .sort((a: any, b: any) => a.time.localeCompare(b.time))
  .reduce((acc: any[], current: any) => {
    const last = acc[acc.length - 1];
    if (!last || last.time !== current.time) {
      acc.push(current);
    } else {
      // If duplicate time, overwrite with the latest entry
      acc[acc.length - 1] = current;
    }
    return acc;
  }, []);

  // Filter chart data based on selected time period
  const getFilteredChartData = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (selectedPeriod) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5Y':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
    }

    return allChartData.filter(data => {
      const dataDate = new Date(data.time);
      return dataDate >= cutoffDate;
    });
  };

  const chartData = getFilteredChartData();

  const handleAnalyze = async () => {
    if (!data) return;
    setAnalyzing(true);

    // Convert prices to selected currency for AI analysis
    const isSourceINR = quote.currency === 'INR' || symbol?.endsWith('.NS') || symbol?.endsWith('.BO');
    const convertedPrice = currency === 'INR' && !isSourceINR ? quote.regularMarketPrice * fxRate :
                          currency === 'USD' && isSourceINR ? quote.regularMarketPrice / fxRate :
                          quote.regularMarketPrice;
    const convertedMarketCap = currency === 'INR' && !isSourceINR ? quote.marketCap * fxRate :
                              currency === 'USD' && isSourceINR ? quote.marketCap / fxRate :
                              quote.marketCap;

    const result = await analyzeAsset(symbol!, {
      name: quote.longName || quote.shortName,
      price: convertedPrice,
      change: quote.regularMarketChangePercent,
      marketCap: convertedMarketCap,
      volume: quote.regularMarketVolume,
      summary: quote.longBusinessSummary
    }, currency);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleExplainChart = async () => {
    if (!chartData.length) return;
    setExplainingChart(true);

    // Convert chart data prices to selected currency
    const isSourceINR = quote.currency === 'INR' || symbol?.endsWith('.NS') || symbol?.endsWith('.BO');
    const convertedChartData = chartData.map(point => ({
      ...point,
      open: currency === 'INR' && !isSourceINR ? point.open * fxRate :
            currency === 'USD' && isSourceINR ? point.open / fxRate :
            point.open,
      high: currency === 'INR' && !isSourceINR ? point.high * fxRate :
            currency === 'USD' && isSourceINR ? point.high / fxRate :
            point.high,
      low: currency === 'INR' && !isSourceINR ? point.low * fxRate :
           currency === 'USD' && isSourceINR ? point.low / fxRate :
           point.low,
      close: currency === 'INR' && !isSourceINR ? point.close * fxRate :
             currency === 'USD' && isSourceINR ? point.close / fxRate :
             point.close
    }));

    const result = await explainChart(symbol!, convertedChartData, currency);
    setChartExplanation(result);
    setExplainingChart(false);
  };

  return (
    <div className="p-8 space-y-10">
      {/* Header Panel */}
      <div className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white/80 flex items-center justify-center text-3xl font-black text-primary shadow-sm overflow-hidden">
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={symbol}
                className="w-full h-full object-contain p-2"
                onError={() => setLogoError(true)}
                loading="lazy"
              />
            ) : (
              <span>{symbol?.substring(0, 2)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{symbol}</h1>
              <span className="text-[10px] font-black px-3 py-1.5 bg-slate-100 rounded-xl text-slate-500 uppercase tracking-widest">{quote.quoteType}</span>
            </div>
            <p className="text-slate-500 font-bold text-lg mt-1">{quote.longName || quote.shortName}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-4xl font-black text-slate-900 tracking-tight">
              {formatCurrency(quote.regularMarketPrice, currency, fxRate, isINR)}
            </p>
            <p className={cn(
              "text-xl font-black flex items-center justify-end gap-1.5 mt-1",
              isPositive ? "text-primary" : "text-negative"
            )}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {isPositive ? '+' : ''}{quote.regularMarketChangePercent?.toFixed(2)}%
            </p>
          </div>
          <button 
            onClick={() => isWatched ? removeFromWatchlist(symbol!) : addToWatchlist(symbol!)}
            className={cn(
              "p-5 rounded-3xl border transition-all duration-300 active:scale-90 shadow-sm",
              isWatched ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/80 border-white/50 text-slate-400 hover:text-slate-600"
            )}
          >
            {isWatched ? <Check className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-primary" /> Market Performance
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExplainChart}
                  disabled={explainingChart}
                  className="btn-glass !text-[10px] !px-4 !py-2 !rounded-xl"
                >
                  {explainingChart ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Explain Chart
                </button>

                {/* Chart Type Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/50 text-[10px] font-black text-slate-700 hover:bg-white/70 transition-all active:scale-90"
                  >
                    Chart Type
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showChartTypeMenu && "rotate-180")} />
                  </button>
                  {showChartTypeMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg z-50 overflow-hidden">
                      {(['candlestick', 'line', 'bar', 'smart-trend'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setChartType(type);
                            setShowChartTypeMenu(false);
                          }}
                          className={cn(
                            "w-full px-6 py-2.5 text-left text-[11px] font-bold transition-colors border-b border-white/30 last:border-b-0",
                            chartType === type
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {type === 'smart-trend' ? 'Smart Trend' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeframe Selector */}
                <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-white/50 gap-1">
                  {(['1M', '3M', '1Y', '5Y'] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedPeriod(t)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-90",
                        selectedPeriod === t ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: '400px' }}>
              <PriceChart 
                data={chartData} 
                type={chartType}
                currency={currency}
                fxRate={fxRate}
                isSourceINR={isINR}
              />
            </div>
          </div>

          {chartExplanation && (
            <div className="glass-card !bg-white/60 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Chart Analysis</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AI-generated explanation</p>
                  </div>
                </div>
                <div className={cn(
                  "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                  chartExplanation.trend === 'Upward' ? "bg-primary text-white" :
                  chartExplanation.trend === 'Downward' ? "bg-negative text-white" :
                  "bg-slate-200 text-slate-600"
                )}>
                  {chartExplanation.trend} Trend
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {chartExplanation.explanation}
                  </p>
                  <div className="flex items-start gap-4 p-6 bg-white/80 rounded-[2rem] border border-white/50 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trading Insight</p>
                      <p className="text-sm text-slate-700 leading-relaxed font-bold">{chartExplanation.insight}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-negative/5 rounded-[2.5rem] border border-negative/10 space-y-6 shadow-inner">
                  <div className="flex items-center gap-3 text-negative">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Risk Warning</span>
                  </div>
                  <p className="text-sm text-negative/80 leading-relaxed font-bold">
                    {chartExplanation.riskWarning}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Market Cap', value: formatCompactNumber(quote.marketCap) },
              { label: 'PE Ratio', value: quote.trailingPE?.toFixed(2) || 'N/A' },
              { label: 'Volume', value: formatCompactNumber(quote.regularMarketVolume) },
              { label: '52W High', value: formatCurrency(quote.fiftyTwoWeekHigh, currency, fxRate, isINR) },
            ].map(metric => (
              <div key={metric.label} className="glass-card !p-6 !rounded-[2rem]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{metric.label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="space-y-10">
          <div className="glass-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-400" /> AI Analysis
                </h2>
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="text-[10px] font-black px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 border border-white/10"
                >
                  {analyzing ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>

              {!analysis && !analyzing ? (
                <div className="text-center py-12 space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                    <BrainCircuit className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Run AI analysis to get deep insights into this asset's performance and trends.</p>
                  <button 
                    onClick={handleAnalyze}
                    className="btn-primary-glass w-full !py-4"
                  >
                    Generate Insights
                  </button>
                </div>
              ) : analyzing ? (
                <div className="space-y-6 py-8">
                  <div className="h-6 bg-white/10 animate-pulse rounded-full w-3/4" />
                  <div className="h-6 bg-white/10 animate-pulse rounded-full w-1/2" />
                  <div className="h-32 bg-white/10 animate-pulse rounded-[2rem]" />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Score</p>
                      <p className="text-5xl font-black text-primary tracking-tighter">{analysis.aiScore}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trend</p>
                      <p className={cn(
                        "text-xl font-black tracking-tight",
                        analysis.trend === 'Bullish' ? "text-primary" : analysis.trend === 'Bearish' ? "text-negative" : "text-slate-300"
                      )}>{analysis.trend}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 shadow-inner">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-accent" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Evaluation</span>
                    </div>
                    <p className="text-lg font-black">{analysis.riskScore} Risk</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{analysis.summary}</p>
                  </div>

                  {isPro ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Advantages</p>
                          <ul className="text-xs text-slate-300 space-y-2">
                            {analysis.pros?.map((p: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-negative uppercase tracking-widest">Disadvantages</p>
                          <ul className="text-xs text-slate-300 space-y-2">
                            {analysis.cons?.map((c: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <X className="w-3 h-3 text-negative mt-0.5 shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Future Plans</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{analysis.futurePlans}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-[2rem] p-8 border border-dashed border-white/20 text-center space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">Upgrade to Pro to unlock Advantages, Disadvantages, and Future Plans.</p>
                      <button className="text-xs font-black text-primary hover:text-emerald-400 transition-colors uppercase tracking-widest">Upgrade Now</button>
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-widest">Suggestion</span>
                      <span className={cn(
                        "px-6 py-2.5 rounded-2xl font-black text-sm shadow-lg",
                        analysis.suggestion === 'Buy' ? "bg-primary text-white shadow-primary/20" : 
                        analysis.suggestion === 'Sell' ? "bg-negative text-white shadow-negative/20" : "bg-white/10 text-white"
                      )}>{analysis.suggestion}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute right-0 top-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-primary/20 transition-all duration-700" />
          </div>

          <div className="glass-card !rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Info className="w-6 h-6 text-slate-400" /> About {symbol}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {quote.longBusinessSummary || "No detailed information available for this asset."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export default AssetDetail;
