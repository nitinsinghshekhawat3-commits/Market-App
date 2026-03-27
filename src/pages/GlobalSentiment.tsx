import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  Globe, 
  Activity, 
  Newspaper, 
  ArrowUpRight, 
  ArrowDownRight,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getGlobalSentiment } from '../services/aiService';
import { getApiUrl } from '../lib/apiConfig';
import { cn } from '../lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MarketData {
  country: string;
  index: string;
  symbol: string;
  price: number;
  change: number;
  news: { title: string; publisher: string; link: string }[];
}

interface SentimentData {
  country: string;
  sentimentScore: number;
  label: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
}

interface GlobalInsights {
  mostBullish: string;
  mostBearish: string;
  overallScore: number;
}

export const GlobalSentiment = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [globalInsights, setGlobalInsights] = useState<GlobalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchData = async () => {
    try {
      const res = await fetch(getApiUrl('api/global-sentiment'));
      const data = await res.json();
      setMarketData(data);

      const aiSentiment = await getGlobalSentiment(data);
      if (aiSentiment) {
        setSentimentData(aiSentiment.countries);
        setGlobalInsights(aiSentiment.global);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching global sentiment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 90000); // 90 seconds
    return () => clearInterval(interval);
  }, []);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#EF4444", "#F59E0B", "#00C896"])
      .interpolate(interpolateRgb);
  }, []);

  const getCountrySentiment = (countryName: string) => {
    // Map some common variations in country names between topojson and API
    const mapping: Record<string, string> = {
      "United States of America": "USA",
      "United Kingdom": "United Kingdom",
      "Germany": "Germany",
      "India": "India",
      "Japan": "Japan",
      "China": "China"
    };
    
    const mappedName = mapping[countryName] || countryName;
    return sentimentData.find(s => s.country === mappedName);
  };

  const getCountryMarket = (countryName: string) => {
    const mapping: Record<string, string> = {
      "United States of America": "USA",
      "United Kingdom": "United Kingdom",
      "Germany": "Germany",
      "India": "India",
      "Japan": "Japan",
      "China": "China"
    };
    const mappedName = mapping[countryName] || countryName;
    return marketData.find(m => m.country === mappedName);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return null;
    const market = getCountryMarket(selectedCountry);
    const sentiment = getCountrySentiment(selectedCountry);
    return { market, sentiment };
  }, [selectedCountry, marketData, sentimentData]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen pb-20" onMouseMove={handleMouseMove}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-rich tracking-tight mb-2">Global Market Sentiment</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            Real-time global financial mood based on AI analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            LIVE
          </div>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-sm font-bold text-slate-700">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Top Insight Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading && !globalInsights ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 animate-pulse">
              <div className="w-14 h-14 bg-slate-100 rounded-3xl" />
              <div className="flex-1">
                <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
                <div className="h-6 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          ))
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Most Bullish</p>
                <p className="text-xl font-bold text-slate-900">{globalInsights?.mostBullish || 'Loading...'}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-red-100 rounded-3xl flex items-center justify-center text-red-600">
                <TrendingDown className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Most Bearish</p>
                <p className="text-xl font-bold text-slate-900">{globalInsights?.mostBearish || 'Loading...'}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Global Sentiment</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-slate-900">{globalInsights?.overallScore || '--'}</p>
                  <p className="text-sm font-bold text-slate-400 mb-1">/ 100</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Main Map Section */}
      <div className="relative bg-white/40 backdrop-blur-2xl border border-white rounded-[3rem] shadow-xl overflow-hidden min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-bold text-slate-700">Analyzing Global Markets...</p>
          </div>
        )}

        <ComposableMap projectionConfig={{ scale: 200 }}>
          <ZoomableGroup center={[20, 10]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const sentiment = getCountrySentiment(geo.properties.name);
                  const market = getCountryMarket(geo.properties.name);
                  const isInteractive = !!sentiment;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => isInteractive && setHoveredCountry(geo.properties.name)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => isInteractive && setSelectedCountry(geo.properties.name)}
                      style={{
                        default: {
                          fill: sentiment ? colorScale(sentiment.sentimentScore) : "#F1F5F9",
                          outline: "none",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          transition: "all 0.3s ease"
                        },
                        hover: {
                          fill: sentiment ? colorScale(sentiment.sentimentScore) : "#E2E8F0",
                          outline: "none",
                          stroke: "#FFFFFF",
                          strokeWidth: 1,
                          cursor: isInteractive ? "pointer" : "default",
                          filter: isInteractive ? "brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.1))" : "none"
                        },
                        pressed: {
                          fill: sentiment ? colorScale(sentiment.sentimentScore) : "#CBD5E1",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-10 left-10 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sentiment Legend</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00C896]" />
              <span className="text-xs font-bold text-slate-600">Bullish (70-100)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-bold text-slate-600">Neutral (40-69)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="text-xs font-bold text-slate-600">Bearish (0-39)</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredCountry && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              style={{ 
                position: 'fixed', 
                left: tooltipPos.x + 20, 
                top: tooltipPos.y - 120,
                zIndex: 100
              }}
              className="pointer-events-none"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-2xl min-w-[240px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{hoveredCountry}</h3>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    getCountrySentiment(hoveredCountry)?.label === 'Bullish' ? "bg-emerald-100 text-emerald-600" :
                    getCountrySentiment(hoveredCountry)?.label === 'Bearish' ? "bg-red-100 text-red-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {getCountrySentiment(hoveredCountry)?.label}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{getCountryMarket(hoveredCountry)?.index}</span>
                    <span className={cn(
                      "text-xs font-bold flex items-center gap-1",
                      (getCountryMarket(hoveredCountry)?.change || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {(getCountryMarket(hoveredCountry)?.change || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(getCountryMarket(hoveredCountry)?.change || 0).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{ 
                        width: `${getCountrySentiment(hoveredCountry)?.sentimentScore}%`,
                        backgroundColor: colorScale(getCountrySentiment(hoveredCountry)?.sentimentScore || 50)
                      }}
                    />
                  </div>
                  
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{getCountrySentiment(hoveredCountry)?.summary.slice(0, 100)}..."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel / Modal for Details */}
      <AnimatePresence>
        {selectedCountry && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCountry(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{selectedCountry}</h2>
                      <p className="text-slate-500 font-medium">{selectedCountryData?.market?.index}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCountry(null)}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {/* Score Card */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Sentiment Score</p>
                      <p className="text-5xl font-bold text-slate-900">{selectedCountryData?.sentiment?.sentimentScore}</p>
                    </div>
                    <div className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold shadow-sm",
                      selectedCountryData?.sentiment?.label === 'Bullish' ? "bg-emerald-500 text-white" :
                      selectedCountryData?.sentiment?.label === 'Bearish' ? "bg-red-500 text-white" :
                      "bg-amber-500 text-white"
                    )}>
                      {selectedCountryData?.sentiment?.label}
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedCountryData?.sentiment?.sentimentScore}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full"
                      style={{ backgroundColor: colorScale(selectedCountryData?.sentiment?.sentimentScore || 50) }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedCountryData?.sentiment?.summary}
                  </p>
                </div>

                {/* Market Performance */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Market Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Price</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedCountryData?.market?.price ? selectedCountryData.market.price.toLocaleString() : '--'}
                      </p>
                    </div>
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">24h Change</p>
                      <p className={cn(
                        "text-2xl font-bold flex items-center gap-1",
                        (selectedCountryData?.market?.change || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {(selectedCountryData?.market?.change || 0) >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                        {Math.abs(selectedCountryData?.market?.change || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* News Headlines */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    Recent News
                  </h3>
                  <div className="space-y-4">
                    {selectedCountryData?.market?.news.map((n, i) => (
                      <a 
                        key={i}
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-5 bg-white border border-slate-100 rounded-3xl hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 leading-snug">
                          {n.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.publisher}</span>
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
