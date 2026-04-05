import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { getCompanyLogoUrl } from '../lib/logoMap';

export const MarketStrip = () => {
  const { currency, fxRate, theme } = useApp();
  const [markets, setMarkets] = useState<any[]>([]);
useEffect(() => {
  fetch('/api/markets')
    .then(res => res.json())
    .then(data => {
      console.log("MARKET DATA:", data);

      if (Array.isArray(data)) {
        setMarkets(data);
      } else {
        console.error("Market data is not an array:", data);
        setMarkets([]);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch markets:", err);
      setMarkets([]);
    });
}, []);

  if (markets.length === 0) return null;

  // Duplicate the list to create a seamless loop
  const duplicatedMarkets = [...markets, ...markets];

  return (
    <div className="relative overflow-hidden py-2 corner-flames-bg corner-flames-bg-top">
      <motion.div 
        className="flex gap-6 px-4"
        animate={{
          x: [0, -100 * markets.length],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedMarkets.map((m, index) => {
          const isSourceINR = m.currency === 'INR' || m.symbol?.endsWith('.NS') || m.symbol?.endsWith('.BO');
          return (
            <div key={`${m.symbol}-${index}`} className={cn(
                "flex-shrink-0 backdrop-blur-md border rounded-3xl p-5 min-w-[220px] shadow-sm hover:shadow-md transition-all duration-300 group",
                theme === 'dark'
                  ? 'bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-800/90 border-slate-700'
                  : 'bg-white/40 border-white/40'
              )}>
              <div className="flex justify-between items-start mb-3">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  theme === 'dark' ? 'text-slate-300 group-hover:text-primary' : 'text-slate-400 group-hover:text-primary'
                )}>{m.shortName || m.symbol}</span>
                <span className={cn(
                  "text-[10px] font-black px-2.5 py-1 rounded-lg",
                  m.regularMarketChangePercent >= 0 ? "bg-primary/10 text-primary" : "bg-negative/10 text-negative"
                )}>
                  {m.regularMarketChangePercent >= 0 ? '+' : ''}{m.regularMarketChangePercent?.toFixed(2)}%
                </span>
              </div>
              <p className={cn("text-xl font-black", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {formatCurrency(m.regularMarketPrice, currency, fxRate, isSourceINR)}
              </p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const SectorPerformance: React.FC<{ country?: string }> = ({ country = 'US' }) => {
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [offset, setOffset] = useState(0);
  const visibleCount = 4;

  useEffect(() => {
    setOffset(0);
    fetchSectors(selectedCountry);
  }, [selectedCountry]);

  const fetchSectors = async (countryCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sectors?country=${countryCode}`);
      const payload = await res.json();

      // Normalize API response shape for compatibility
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      setSectors(normalized);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
  };

  const handlePrev = () => {
    setOffset(prev => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setOffset(prev => Math.min(Math.max(0, sectors.length - visibleCount), prev + visibleCount));
  };

  const displayedSectors = sectors.slice(offset, offset + visibleCount);

  const { theme } = useApp();

  return (
    <div className="space-y-6">
      {/* Country Filter */}
      <div className="flex items-center justify-between">
        <h3 className={cn("text-lg font-bold", theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>Sector Performance</h3>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={cn("px-4 py-2 border rounded-xl text-sm font-bold", theme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-700')}
        >
          <option value="US">United States</option>
          <option value="IN">India</option>
        </select>
      </div>

      {/* Sector Slider */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/30 animate-pulse rounded-lg" />
              <div className="h-2 bg-white/30 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      ) : sectors.length > 0 ? (
        <>
          <div className="flex justify-end gap-2">
            <button
              onClick={handlePrev}
              disabled={offset === 0}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition',
                offset === 0
                  ? theme === 'dark'
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={offset + visibleCount >= sectors.length}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition',
                offset + visibleCount >= sectors.length
                  ? theme === 'dark'
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {displayedSectors.map(sector => {
            const shortNames: Record<string,string> = {
              'Information Technology': 'IT',
              'Banking & Financial Services': 'Banking',
              'Consumer Discretionary': 'Consumer',
              'Communication Services': 'Comm',
              'Consumer Goods': 'Consumer Goods',
              'Pharmaceuticals': 'Pharma',
              'Automotive': 'Auto',
            };
            const displayName = shortNames[sector.name] || sector.name;
            // Normalize a small sector move to an intuitive fill range:
            // 0-5% => 0-100% width. Moves beyond 5% still cap at 100%.
            const changeValue = Number(sector.change) || 0;
            const maxChunk = 5;
            const barWidth = Math.min(100, (Math.abs(changeValue) / maxChunk) * 100);
            const barColor = changeValue >= 0 ? 'bg-emerald-400' : 'bg-red-400';

            return (
              <div key={sector.name} className={cn(
                'space-y-2 p-4 rounded-2xl shadow-sm',
                changeValue >= 0
                  ? 'border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-400/30 dark:bg-emerald-900/40'
                  : 'border-red-200/60 bg-red-50/40 dark:border-red-400/30 dark:bg-red-900/40',
                theme === 'dark' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/60'
              )}>
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-bold truncate max-w-[160px]', theme === 'dark' ? 'text-slate-100' : 'text-slate-700')}>
                    {displayName}
                  </span>
                  <span className={cn('text-xs font-black', sector.change >= 0 ? 'text-primary' : 'text-negative')}>
                    {sector.change > 0 ? '+' : ''}{sector.change}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-1000', barColor)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 font-medium">Sector data unavailable</p>
        </div>
      )}
    </div>
  );
};

export const AssetCard: React.FC<{ asset: any }> = ({ asset }) => {
  const { currency, fxRate, theme } = useApp();
  const [fallbackLogoUrl, setFallbackLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const isPositive = asset.regularMarketChangePercent >= 0;
  const isINR = asset.currency === 'INR' || asset.symbol?.endsWith('.NS') || asset.symbol?.endsWith('.BO');

  useEffect(() => {
    // If no Yahoo logo, fetch Google favicon as fallback
    if (!asset.logoUrl) {
      const fetchFallbackLogo = async () => {
        try {
          const url = await getCompanyLogoUrl(asset.symbol);
          if (url) {
            setFallbackLogoUrl(url);
          }
        } catch (error) {
          console.error('Error fetching fallback logo:', error);
        }
      };
      fetchFallbackLogo();
    }
  }, [asset.symbol, asset.logoUrl]);

  const logoUrl = asset.logoUrl || fallbackLogoUrl;

  return (
    <div className={cn(
      'backdrop-blur-md rounded-[2.5rem] p-8 border hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group',
      theme === 'dark'
        ? 'bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/70 border-slate-700 text-slate-100'
        : 'bg-white/40 border-white/40 text-slate-900'
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {/* Logo or Initial Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm overflow-hidden">
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={asset.symbol}
                className="w-full h-full object-contain p-1.5"
                onError={() => setLogoError(true)}
                loading="lazy"
              />
            ) : (
              <span>{asset.symbol.substring(0, 2)}</span>
            )}
          </div>
          <div>
            <h3 className={cn('font-black text-lg group-hover:text-primary transition-colors', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{asset.symbol}</h3>
            <p className={cn('text-[10px] uppercase font-black tracking-widest truncate max-w-[120px]', theme === 'dark' ? 'text-slate-300' : 'text-slate-400')}>{asset.shortName}</p>
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-2xl shadow-sm",
          isPositive ? "bg-primary/10 text-primary" : "bg-negative/10 text-negative"
        )}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900 tracking-tight">
          {formatCurrency(asset.regularMarketPrice, currency, fxRate, isINR)}
        </p>
        <p className={cn(
          "text-sm font-black flex items-center gap-1",
          isPositive ? "text-primary" : "text-negative"
        )}>
          {isPositive ? '+' : ''}{asset.regularMarketChangePercent?.toFixed(2)}%
          <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">Today</span>
        </p>
      </div>
    </div>
  );
};
