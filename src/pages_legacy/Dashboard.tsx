import React, { useState, useEffect } from 'react';
import { MarketStrip, AssetCard, SectorPerformance } from '../components/DashboardComponents';
import { useApp } from '../context/AppContext';
import { Globe, Star, Zap, BarChart3, TrendingUp, TrendingDown, Activity, BrainCircuit } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { getCompanyLogoUrl } from '../lib/logoMap';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { watchlist, isPro, theme } = useApp();

  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'stocks') {
          // Fetch stock data
          const symbols = ['AAPL', 'TSLA', 'NVDA', 'RELIANCE.NS', 'MSFT', 'GOOGL'];
          const response = await Promise.all(
            symbols.map(s => fetch(`/api/stocks/${s}`).then(res => res.json()).catch(() => null))
          );
          setTrending(response.filter(r => r && r.quote).map(r => r.quote));
        } else {
          // Fetch crypto data
          const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'polkadot'];
          const response = await Promise.all(
            cryptoIds.map(id => fetch(`/api/crypto/${id}`).then(res => res.json()).catch(() => null))
          );
          setTrending(response.filter(r => r).map(r => ({
            symbol: r.id.toUpperCase(),
            shortName: r.name,
            regularMarketPrice: r.market_data?.current_price?.usd || 0,
            regularMarketChangePercent: r.market_data?.price_change_percentage_24h || 0,
            currency: 'USD',
            quoteType: 'CRYPTOCURRENCY'
          })));
        }
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, [activeTab]);

  return (
    <div className="smooth-transition p-4 md:p-8 space-y-8 md:space-y-12 animate-fade-in">
      <section className="">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-0 md:px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Globe className="w-6 md:w-8 h-6 md:h-8 text-primary flex-shrink-0" /> Global Markets
          </h2>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
        <div className="glass-card !p-4 md:!p-6">
          <MarketStrip />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          <section className="animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-0 md:px-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Zap className="w-5 md:w-6 h-5 md:h-6 text-amber-400 flex-shrink-0" /> Market Movers
              </h2>
              <div className="flex gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm">
                <button 
                  onClick={() => setActiveTab('stocks')}
                  className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all smooth-transition-fast ${activeTab === 'stocks' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Stocks
                </button>
                <button 
                  onClick={() => setActiveTab('crypto')}
                  className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all smooth-transition-fast ${activeTab === 'crypto' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Crypto
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-40 bg-white/50 dark:bg-slate-800/50 animate-pulse rounded-[2.5rem] border border-white/50 dark:border-slate-700" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {trending.map((asset, index) => (
                  <div key={`${asset.symbol}-${index}`} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Link to={`/asset/${asset.symbol}`}>
                      <AssetCard asset={asset} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6 md:space-y-10">
          <section className={cn('glass-card p-4 md:p-6 rounded-2xl animate-slide-down', theme === 'dark' ? 'bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-slate-800/80 border border-slate-600 shadow-[0_15px_35px_rgba(0,0,0,0.45)]' : 'bg-white/80 border border-white/60')}>
            <h2 className={cn('text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center gap-3', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              <Star className="w-5 md:w-6 h-5 md:h-6 text-amber-300 fill-amber-300 flex-shrink-0" /> Watchlist
            </h2>
            <div className="space-y-2">
              
              {/* ✅ FIXED (only this condition changed) */}
              {watchlist.length === 0 ? (
                <div className="text-center py-8 md:py-12 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-slate-200 dark:text-slate-400" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-medium">Your watchlist is empty.</p>
                </div>
              ) : (
                // Show only the last 3 recent stocks
                watchlist.slice(-3).map((symbol) => (
                 <WatchlistItem key={symbol} symbol={symbol} />
                ))
              )}
            </div>
          </section>

          <section className={cn('glass-card p-4 md:p-6 rounded-2xl animate-slide-down', theme === 'dark' ? 'bg-gradient-to-b from-slate-900/85 via-slate-800/80 to-slate-700/80 border border-slate-600 shadow-[0_12px_30px_rgba(0,0,0,0.42)]' : 'bg-white/80 border border-white/60')}>
            <SectorPerformance />
          </section>
        </div>
      </div>

      <section className="glass-dark rounded-[3rem] p-6 md:p-12 text-white relative overflow-hidden group lg:col-span-3 animate-slide-up">
        <div className="relative z-10 w-full">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-primary/10">
            <BrainCircuit className="w-6 md:w-8 h-6 md:h-8 text-primary" />
          </div>
          <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">AI Intelligence <br/>at your fingertips.</h3>
          <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-10 leading-relaxed">Get institutional-grade analysis for any asset worldwide using our advanced Gemini-powered engine.</p>
          <button className="relative rounded-xl px-6 md:px-10 py-3 md:py-4 text-sm md:text-base font-bold text-white bg-primary transition-all duration-300 smooth-transition shadow-[0_0_15px_rgba(16,185,129,0.45)] hover:shadow-[0_0_25px_rgba(16,185,129,0.8)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring focus-visible:ring-emerald-200/60">
            Try AI Analysis
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -mr-32 -mb-32 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="absolute left-1/2 top-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full group-hover:bg-accent/20 transition-all duration-700" />
      </section>

    </div>
  );
};
const WatchlistItem = ({ symbol }: { symbol: string; key?: string }) => {
  const { currency, fxRate, theme } = useApp();
  const [data, setData] = useState<any>(null);
  const [fallbackLogoUrl, setFallbackLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch(`/api/stocks/${symbol}`)
      .then(res => res.json())
      .then(d => {
        setData(d.quote);
        // If no Yahoo logo, fetch Google favicon as fallback
        if (!d.quote.logoUrl) {
          getCompanyLogoUrl(symbol).then(url => {
            if (url) setFallbackLogoUrl(url);
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [symbol]);

  if (!data) return <div className="h-16 bg-white/30 animate-pulse rounded-2xl border border-white/20" />;

  const isINR = data.currency === 'INR' || symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const logoUrl = data.logoUrl || fallbackLogoUrl;

  return (
    <Link
      to={`/asset/${symbol}`}
      className={cn(
        'flex items-center justify-between p-4 rounded-3xl transition-all group border shadow-sm',
        theme === 'dark'
          ? 'bg-gradient-to-b from-slate-900/80 via-slate-850/80 to-slate-800/75 border-slate-700 hover:bg-slate-800/90 hover:border-slate-600'
          : 'bg-white/40 hover:bg-white/60 border-transparent hover:border-white/50'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm overflow-hidden">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={symbol}
              className="w-full h-full object-contain p-1"
              onError={() => setLogoError(true)}
              loading="lazy"
            />
          ) : (
            <span>{symbol.substring(0, 2)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{symbol}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{data.quoteType}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-slate-900">{formatCurrency(data.regularMarketPrice, currency, fxRate, isINR)}</p>
        <p className={cn("text-[10px] font-black", data.regularMarketChangePercent >= 0 ? "text-primary" : "text-negative")}>
          {data.regularMarketChangePercent >= 0 ? '+' : ''}{data.regularMarketChangePercent?.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
};
