import React from 'react';
import { AssetCard } from '../components/DashboardComponents';
import { Link } from 'react-router-dom';
import { Compass, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { getApiUrl } from '../lib/apiConfig';

// Map crypto symbols to CoinGecko IDs
const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'BTC': 'bitcoin',
  'ETH-USD': 'ethereum',
  'ETH': 'ethereum',
  'SOL-USD': 'solana',
  'SOL': 'solana',
  'BNB-USD': 'binancecoin',
  'ADA-USD': 'cardano',
  'XRP-USD': 'ripple',
  'DOT-USD': 'polkadot',
  'DOGE-USD': 'dogecoin'
};

export const Explore = () => {
  const [trending, setTrending] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState('Stocks');

  React.useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const symbols = category === 'Stocks' 
          ? ['AAPL', 'TSLA', 'NVDA', 'RELIANCE.NS', 'MSFT', 'GOOGL', 'AMZN', 'META']
          : ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'ADA-USD', 'XRP-USD', 'DOT-USD', 'DOGE-USD'];
        
        if (category === 'Stocks') {
          const response = await Promise.all(
            symbols.map(s => fetch(getApiUrl(`api/stocks/${s}`)).then(res => res.json()).catch(() => null))
          );
          setTrending(response.filter(r => r && r.quote).map(r => r.quote));
        } else {
          // For crypto, map symbols to CoinGecko IDs
          const cryptoIds = symbols.map(s => CRYPTO_SYMBOL_MAP[s] || s.toLowerCase().replace('-usd', ''));
          const response = await Promise.all(
            cryptoIds.map(id => fetch(getApiUrl(`api/crypto/${id}`)).then(res => res.json()).catch(() => null))
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
  }, [category]);

  return (
    <div className="p-8 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
            <Compass className="w-10 h-10 text-primary" /> Explore Markets
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Discover trending assets across global markets.</p>
        </div>
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm">
          {['Stocks', 'Crypto'].map(c => (
            <button 
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                category === c ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-white/40 backdrop-blur-md animate-pulse rounded-[2.5rem] border border-white/40" />
          ))
        ) : (
          trending.map((asset, index) => (
            <Link key={`${asset.symbol}-${index}`} to={`/asset/${asset.symbol}`}>
              <AssetCard asset={asset} />
            </Link>
          ))
        )}
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-[3rem] p-16 text-white relative overflow-hidden group shadow-2xl"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-10 border border-white/10 shadow-lg shadow-primary/20">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-5xl font-black mb-8 leading-tight tracking-tighter">Institutional Intelligence <br/>for Every Investor.</h2>
          <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
            Our AI engine analyzes millions of data points to give you the same insights used by the world's top hedge funds.
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Real-time Signals</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Trend Prediction</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all">
              <TrendingDown className="w-5 h-5 text-negative" />
              <span className="text-[10px] font-black uppercase tracking-widest">Risk Assessment</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-48 -mb-48 group-hover:bg-primary/20 transition-all duration-1000" />
      </motion.section>
    </div>
  );
};
