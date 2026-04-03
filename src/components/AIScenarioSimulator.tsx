import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, Search, X, Target, Shield, Zap } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { fetchMarketMetrics } from '../services/smartMoneyService';
import { analyzeMarketStructure, MarketIntelligence, getInstitutionalAnalysisPrompt } from '../services/marketIntelligenceService';
import { searchAssets, getPopularAssets, Asset } from '../services/assetSearchService';

export const AIScenarioSimulator: React.FC = () => {
  const { currency, fxRate, theme } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [volatility, setVolatility] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [volumeRatio, setVolumeRatio] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [aiValidation, setAiValidation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const aiValidationCalls = useRef(0);
  const MAX_AI_VALIDATION_CALLS = 10;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load popular assets on mount
  useEffect(() => {
    const popular = getPopularAssets();
    if (popular.length > 0) {
      setSelectedAsset(popular[0]);
    }
  }, []);

  // Handle search input
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(getPopularAssets());
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAssets(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate scenarios when asset changes
  useEffect(() => {
    if (selectedAsset) {
      generateScenariosAsync();
    }
  }, [selectedAsset]);

  const generateScenariosAsync = async () => {
    if (!selectedAsset) return;

    setLoading(true);
    setError(null);
    try {
      const metrics = await fetchMarketMetrics(selectedAsset.symbol, selectedAsset.type);
      
      if (!metrics) {
        throw new Error('Unable to fetch market data. Please check your internet connection.');
      }

      setCurrentPrice(metrics.price);
      setPriceChange(metrics.priceChange);
      setVolumeRatio(metrics.volumeRatio);
      
      // Use real historical volatility from metrics (calculated from price history)
      // This is now PROPERLY calculated daily volatility, not just price change
      const realVolatility = metrics.volatility || 0.05;
      setVolatility(realVolatility);
      
      // Perform institutional market structure analysis
      const intelligence = analyzeMarketStructure(
        metrics.priceChange,
        realVolatility,
        metrics.volumeRatio,
        metrics.price,
        currency as 'USD' | 'INR'
      );
      
      setMarketIntelligence(intelligence);
      setShowDetails(false);
      
      // Get AI validation for the setup (optional enhancement)
      if (aiValidationCalls.current < MAX_AI_VALIDATION_CALLS) {
        try {
          const validationPrompt = getInstitutionalAnalysisPrompt(
            selectedAsset.symbol,
            {
              price: metrics.price,
              priceChange: metrics.priceChange,
              volatility: realVolatility,
              volumeRatio: metrics.volumeRatio
            },
            intelligence
          );

          aiValidationCalls.current += 1;

          // Call AI for validation (optional)
          const aiResponse = await fetchAIValidation(validationPrompt);
          if (aiResponse) {
            setAiValidation(aiResponse);
          }
        } catch (aiError) {
          console.warn('AI validation failed, using market structure analysis only:', aiError);
          // Fallback to market structure analysis is already set
        }
      } else {
        console.warn('AI validation call limit reached', aiValidationCalls.current);
        setAiValidation(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze market';
      setError(errorMessage);
      console.error('Market analysis error:', err);
      setMarketIntelligence(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIValidation = async (prompt: string): Promise<any> => {
    const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY || '') as string;
    const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile') as string;

    if (!GROQ_API_KEY) {
      return null;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 512,
          top_p: 0.9,
          stream: false,
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try code block extraction
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      
      return null;
    } catch (error) {
      console.warn('AI validation fetch failed:', error);
      return null;
    }
  };

  const formatPrice = (price: number): string => {
    try {
      // Detect if this is an Indian stock (INR) - sold on NSE (.NS) or BSE (.BO)
      // These are priced in INR, all other assets (stocks and crypto) are in USD
      const isINR = selectedAsset?.type === 'stock' && 
        (selectedAsset?.symbol.includes('.NS') || selectedAsset?.symbol.includes('.BO'));
      
      // Debug logging for currency conversion issues
      console.log('formatPrice:', {
        symbol: selectedAsset?.symbol,
        rawPrice: price,
        isSourceINR: isINR,
        targetCurrency: currency,
        fxRate: fxRate
      });
      
      return formatCurrency(price, currency, fxRate, isINR);
    } catch (error) {
      console.warn('Currency formatting error:', error);
      if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
      if (price >= 1000) return `${(price / 1000).toFixed(2)}K`;
      return price.toFixed(2);
    }
  };

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5" />;
      case 'sideways':
        return <Minus className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'bullish':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' };
      case 'bearish':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      case 'sideways':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-600' };
    }
  };

  const getRiskLabel = (vol: number): { label: string; color: string } => {
    if (vol > 0.15) return { label: 'High Risk', color: 'text-red-600' };
    if (vol >= 0.08) return { label: 'Medium Risk', color: 'text-amber-600' };
    return { label: 'Low Risk', color: 'text-emerald-600' };
  };

  const getStateColorClass = (state: string) => {
    if (/Bullish/i.test(state) || /Trending Up/i.test(state) || /Breakout/i.test(state)) {
      return theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600';
    }
    if (/Bearish/i.test(state) || /Trending Down/i.test(state) || /Breakdown/i.test(state)) {
      return theme === 'dark' ? 'text-red-300' : 'text-red-600';
    }
    if (/Neutral/i.test(state) || /Accumulation/i.test(state) || /Sideways/i.test(state)) {
      return theme === 'dark' ? 'text-amber-200' : 'text-amber-600';
    }
    return theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  };

  const riskInfo = getRiskLabel(volatility);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={cn("text-2xl font-bold mb-2", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>Market Intelligence Engine</h3>
        <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Institutional-grade analysis of market structure and price action</p>
      </div>
      {/* Unified Search */}
      <div ref={containerRef} className="relative">
        <label className={cn("block text-xs font-black mb-3 uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>1. Select Asset</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search stocks or crypto (BTC, AAPL, Tesla, Bitcoin...)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className={cn("w-full rounded-2xl px-4 pl-10 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all", theme === 'dark' ? "bg-slate-700/60 border border-slate-600 text-slate-100 placeholder-slate-400" : "bg-white/60 border border-white/80 text-slate-900")}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className={cn('absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all', theme === 'dark' ? 'hover:bg-slate-600/50' : 'hover:bg-white/50')}
            >
              <X className={cn('w-4 h-4', theme === 'dark' ? 'text-slate-200' : 'text-slate-400')} />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && (
          <div className={cn("absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto", theme === 'dark' ? 'bg-slate-900/95 backdrop-blur-xl border border-slate-700' : 'bg-white/95 backdrop-blur-xl border border-white/80')}>
            {isSearching ? (
              <div className="px-4 py-6 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" />
                <p className={cn("text-sm mt-2", theme === 'dark' ? 'text-slate-200' : 'text-slate-500')}>Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2 space-y-1">
                {searchResults.map(asset => (
                  <button
                    key={`${asset.symbol}-${asset.type}`}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-all border-l-4 rounded-xl',
                      theme === 'dark' ? 'text-slate-100 bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'text-slate-900 bg-white/80 border-white/80 hover:bg-slate-100',
                      selectedAsset?.symbol === asset.symbol
                        ? theme === 'dark' ? 'border-l-primary bg-primary/15' : 'border-l-primary bg-primary/10'
                        : 'border-l-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className={cn('font-semibold truncate max-w-[200px] text-sm', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{asset.name}</p>
                        <p className={cn('text-xs truncate max-w-[200px]', theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>{asset.symbol}</p>
                      </div>
                      <span className={cn(
                        'flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap',
                        theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-900',
                        asset.type === 'crypto' ? (theme === 'dark' ? 'border border-blue-500' : 'border border-blue-200') : (theme === 'dark' ? 'border border-purple-500' : 'border border-purple-200')
                      )}>
                        {asset.type === 'crypto' ? 'Crypto' : 'Stock'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-slate-500 text-sm">
                {searchQuery ? 'No assets found. Try searching for a symbol or name.' : 'Start typing to search'}
              </div>
            )}
          </div>
        )}

        {/* Selected Asset Display */}
        {selectedAsset && !searchQuery && (
          <div className={cn("mt-2 px-3 py-2 rounded-xl border flex items-center justify-between", theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-primary/10 border-primary/20')}>
            <span className={cn("text-sm font-semibold", theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{selectedAsset.name} ({selectedAsset.symbol})</span>
            <span className={cn("text-xs font-medium", theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>{selectedAsset.type === 'crypto' ? 'Crypto' : 'Stock'}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 mb-1">Analysis Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Market Overview */}
      {currentPrice > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Current Price', value: formatPrice(currentPrice), valueClass: '' },
            { label: '24h Change', value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`, valueClass: priceChange > 0 ? 'text-emerald-600' : priceChange < 0 ? 'text-red-600' : (theme === 'dark' ? 'text-slate-200' : 'text-slate-600') },
            { label: 'Volatility', value: `${(volatility * 100).toFixed(1)}%`, valueClass: '' },
            { label: 'Volume Ratio', value: `${volumeRatio.toFixed(2)}x`, valueClass: '' }
          ].map(item => (
            <div key={item.label} className={cn('backdrop-blur-md p-4 rounded-2xl border', theme === 'dark' ? 'bg-slate-700/60 border-slate-600' : 'bg-white/60 border-white/80')}>
              <p className={cn('text-xs font-semibold uppercase mb-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>{item.label}</p>
              <p className={cn('text-lg font-bold', item.valueClass || (theme === 'dark' ? 'text-slate-100' : 'text-slate-900'))}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Market Intelligence Display */}
      {loading ? (
        <div className="space-y-3">
          <label className={cn("block text-xs font-black mb-3 uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>2. Scenario Analysis</label>
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : marketIntelligence ? (
        <div className="space-y-4">
          <label className={cn("block text-xs font-black mb-3 uppercase tracking-widest", theme === 'dark' ? "text-white" : "text-slate-900")}>2. Scenario Analysis</label>
          {/* Main Market State Card */}
          <div className={cn(
            'border-2 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg',
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-100' 
              : marketIntelligence.market_state.includes('Bullish') || marketIntelligence.market_state === 'Trending Up' || marketIntelligence.market_state === 'Breakout Setup' 
                ? 'bg-emerald-50 border-emerald-200' 
                : marketIntelligence.market_state.includes('Bearish') || marketIntelligence.market_state === 'Trending Down' || marketIntelligence.market_state === 'Breakdown Risk'
                ? 'bg-red-50 border-red-200'
                : marketIntelligence.market_state === 'Accumulation'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
          )}
          onClick={() => setShowDetails(!showDetails)}
          >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h4 className={cn('text-xl font-bold mb-1', getStateColorClass(marketIntelligence.market_state))}>
                  {marketIntelligence.market_state}
                </h4>
                <p className={cn('text-sm leading-relaxed mb-3', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                  <span className={cn('font-semibold mr-2', getStateColorClass(marketIntelligence.market_state))}>
                    {marketIntelligence.market_state} Setup:
                  </span>
                  {marketIntelligence.reasoning}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center text-right">
                <span className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold',
                  marketIntelligence.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' :
                  marketIntelligence.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'
                )}>
                  Confidence: {marketIntelligence.confidence}
                </span>
                <span className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold',
                  marketIntelligence.institutional_bias === 'Bullish' ? 'bg-emerald-100 text-emerald-700' :
                  marketIntelligence.institutional_bias === 'Bearish' ? 'bg-red-100 text-red-700' :
                  theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'
                )}>
                  Bias: {marketIntelligence.institutional_bias}
                </span>
              </div>
            </div>

            {/* Key Levels */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/50 pt-4">
              <div>
                <p className={cn('text-xs font-semibold mb-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Entry Zone</p>
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{marketIntelligence.entry_zone}</p>
              </div>
              <div>
                <p className={cn('text-xs font-semibold mb-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Target Zone</p>
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{marketIntelligence.target_zone}</p>
              </div>
              <div>
                <p className={cn('text-xs font-semibold mb-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Invalidation</p>
                <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{marketIntelligence.invalidation}</p>
              </div>
            </div>
          </div>

          {/* Market Drivers Detail */}
          {showDetails && (
            <div className={cn('grid grid-cols-2 gap-3 rounded-2xl p-4', theme === 'dark' ? 'border-2 border-slate-700' : 'border-2 border-slate-200')}>
              {[
                { label: 'Trend Strength', value: marketIntelligence.market_drivers.trend_strength },
                { label: 'Volume Signal', value: marketIntelligence.market_drivers.volume_signal },
                { label: 'Volatility State', value: marketIntelligence.market_drivers.volatility_state },
                { label: 'Momentum', value: marketIntelligence.market_drivers.momentum }
              ].map((item) => (
                <div key={item.label} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-slate-700/50' : 'bg-white/50')}>
                  <p className={cn('text-xs font-semibold mb-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{item.label}</p>
                  <p className={cn('text-sm', theme === 'dark' ? 'text-slate-100' : 'text-slate-600')}>{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* AI Validation (if available) */}
          {aiValidation && (
            <div className={cn('rounded-2xl p-4 border-2', theme === 'dark' ? 'bg-slate-800/60 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200')}>
              <p className={cn('text-xs font-semibold mb-2', theme === 'dark' ? 'text-slate-200' : 'text-slate-700')}>AI Setup Validation</p>
              <p className={cn('text-sm mb-2', theme === 'dark' ? 'text-slate-100' : 'text-slate-600')}>
                <span className="font-semibold">Setup Valid:</span> {aiValidation.setup_valid ? 'Yes' : 'No'}
              </p>
              <p className={cn('text-sm mb-2', theme === 'dark' ? 'text-slate-100' : 'text-slate-600')}>
                <span className="font-semibold">Primary Scenario:</span> {aiValidation.primary_scenario}
              </p>
              <p className={cn('text-sm', theme === 'dark' ? 'text-slate-100' : 'text-slate-600')}>
                <span className="font-semibold">Key Level:</span> {aiValidation.key_level}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 font-medium">Select an asset to analyze market structure and institutional setups</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className={cn('p-4 rounded-2xl border', theme === 'dark' ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-200')}>
        <p className={cn('text-xs', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
          <strong>Disclaimer:</strong> This analysis is based on technical structure and historical patterns. 
          It is not financial advice. Always conduct independent research and consult professionals before making investment decisions.
        </p>
      </div>
    </div>
  );
};
