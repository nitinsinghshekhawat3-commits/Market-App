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
  const { currency, fxRate, watchlist, addToWatchlist, removeFromWatchlist, isPro, theme } = useApp();
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
        const res = await fetch(`/api/stocks/${symbol}`);
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
    <div className={cn("p-8 space-y-8 animate-pulse", theme === 'dark' ? 'bg-slate-950' : '')}>
      <div className={cn("h-20 rounded-3xl", theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100')} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn("lg:col-span-2 h-96 rounded-3xl", theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100')} />
        <div className={cn("h-96 rounded-3xl", theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100')} />
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
    <div className={cn("p-8 space-y-10", theme === 'dark' ? 'bg-slate-950' : '')}>
      {/* Header Panel */}
      <div className={cn("glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-8", theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50 text-white' : '')}>
        <div className="flex items-center gap-8">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-sm overflow-hidden", theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white/80 text-primary')}>
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
              <h1 className={cn("text-4xl font-black tracking-tight", theme === 'dark' ? 'text-white' : 'text-slate-900')}>{symbol}</h1>
              <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest", theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')}>{quote.quoteType}</span>
            </div>
            <p className={cn("font-bold text-lg mt-1", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>{quote.longName || quote.shortName}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className={cn("text-4xl font-black tracking-tight", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
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
              isWatched ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200" : "bg-white/80 border-white/50 text-slate-400 hover:text-slate-600"
            )}
          >
            {isWatched ? <Check className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-10">
          <div className={cn("glass-card", theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50' : '')}>
            <div className="flex items-center justify-between mb-10">
              <h2 className={cn("text-2xl font-black flex items-center gap-3", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                <BarChart2 className="w-6 h-6 text-primary" /> Market Performance
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExplainChart}
                  disabled={explainingChart}
                  className={cn("btn-glass !text-[10px] !px-4 !py-2 !rounded-xl", theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : '')}
                >
                  {explainingChart ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Explain Chart
                </button>

                {/* Chart Type Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black transition-all active:scale-90", theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white/50 backdrop-blur-md border-white/50 text-slate-700 hover:bg-white/70')}
                  >
                    Chart Type
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showChartTypeMenu && "rotate-180")} />
                  </button>
                  {showChartTypeMenu && (
                    <div className={cn("absolute top-full right-0 mt-2 rounded-2xl border shadow-lg z-50 overflow-hidden", theme === 'dark' ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-white/60 backdrop-blur-xl')}>
                      {(['candlestick', 'line', 'bar', 'smart-trend'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setChartType(type);
                            setShowChartTypeMenu(false);
                          }}
                          className={cn(
                            "w-full px-6 py-2.5 text-left text-[11px] font-bold transition-colors border-b last:border-b-0",
                            chartType === type
                              ? theme === 'dark' ? 'bg-primary/20 text-primary border-slate-700' : 'bg-primary/10 text-primary border-white/30'
                              : theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 border-slate-700' : 'text-slate-700 hover:bg-slate-50 border-white/30'
                          )}
                        >
                          {type === 'smart-trend' ? 'Smart Trend' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeframe Selector */}
                <div className={cn("flex p-1 rounded-xl border gap-1", theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 backdrop-blur-md border-white/50')}>
                  {(['1M', '3M', '1Y', '5Y'] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedPeriod(t)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-90",
                        selectedPeriod === t ? theme === 'dark' ? "bg-slate-700 text-primary shadow-sm" : "bg-white text-primary shadow-sm" : theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
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
            <div className={cn("glass-card space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700", theme === 'dark' ? '!bg-slate-900/80 border-slate-700/50' : '!bg-white/60')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10')}>
                    <MessageSquare className={cn("w-6 h-6", theme === 'dark' ? 'text-primary' : 'text-primary')} />
                  </div>
                  <div>
                    <h3 className={cn("text-xl font-black", theme === 'dark' ? 'text-white' : 'text-slate-900')}>Chart Analysis</h3>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>AI-generated explanation</p>
                  </div>
                </div>
                <div className={cn(
                  "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                  chartExplanation.trend === 'Upward' ? "bg-primary text-white" :
                  chartExplanation.trend === 'Downward' ? "bg-negative text-white" :
                  theme === 'dark' ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                )}>
                  {chartExplanation.trend} Trend
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                  <p className={cn("leading-relaxed font-medium", theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                    {chartExplanation.explanation}
                  </p>
                  <div className={cn("flex items-start gap-4 p-6 rounded-[2rem] border shadow-sm", theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-white/50')}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", theme === 'dark' ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-500')}>
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === 'dark' ? 'text-slate-400' : 'text-slate-400')}>Trading Insight</p>
                      <p className={cn("text-sm leading-relaxed font-bold", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{chartExplanation.insight}</p>
                    </div>
                  </div>
                </div>
                <div className={cn("p-8 rounded-[2.5rem] border space-y-6 shadow-inner", theme === 'dark' ? 'bg-negative/10 border-negative/20' : 'bg-negative/5 border-negative/10')}>
                  <div className={cn("flex items-center gap-3", theme === 'dark' ? 'text-rose-400' : 'text-negative')}>
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Risk Warning</span>
                  </div>
                  <p className={cn("text-sm leading-relaxed font-bold", theme === 'dark' ? 'text-rose-300/80' : 'text-negative/80')}>
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
              <div key={metric.label} className={cn("glass-card !p-6 !rounded-[2rem]", theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50' : '')}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-2", theme === 'dark' ? 'text-slate-400' : 'text-slate-400')}>{metric.label}</p>
                <p className={cn("text-xl font-black tracking-tight", theme === 'dark' ? 'text-white' : 'text-slate-900')}>{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="space-y-10">
          <div className={cn("rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group", theme === 'dark' ? 'glass-dark text-white' : 'glass-dark text-white')}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-400" /> AI Analysis
                </h2>
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={cn("text-[10px] font-black px-4 py-2 rounded-xl transition-all disabled:opacity-50 border", theme === 'dark' ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white')}
                >
                  {analyzing ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>

              {!analysis && !analyzing ? (
                <div className="text-center py-12 space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                    <BrainCircuit className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">Run AI analysis to get deep insights into this asset's performance and trends.</p>
                  <button 
                    onClick={handleAnalyze}
                    className="btn-primary-glass w-full !py-4 rounded-[2rem] shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    Generate Insights
                    {theme === 'dark' && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-cyan-400 rounded-full opacity-80" />
                    )}
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
