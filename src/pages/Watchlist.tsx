import React from 'react';
import { useApp } from '../context/AppContext';
import { AssetCard } from '../components/DashboardComponents';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export const Watchlist = () => {
  const { watchlist } = useApp();
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWatchlist = async () => {
      if (watchlist.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const response = await Promise.all(
          watchlist.map(s => fetch(`/api/stocks/${s}`).then(res => res.json()).catch(() => null))
        );
        setAssets(response.filter(r => r && r.quote).map(r => r.quote));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [watchlist]);

  return (
    <div className="p-8 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
            <Star className="w-10 h-10 text-amber-400 fill-amber-400" /> My Watchlist
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Track your favorite assets and get real-time updates.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/40 backdrop-blur-md animate-pulse rounded-[2.5rem] border border-white/40" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-card !bg-white/30 p-20 text-center border-dashed border-slate-300 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-white/50">
            <Star className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your watchlist is empty</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-bold text-lg leading-relaxed">Start adding assets to your watchlist to track their performance and get AI insights.</p>
          <Link to="/explore" className="btn-primary-glass !px-10 !py-4 !rounded-2xl">
            Explore Assets <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset, index) => (
            <Link key={`${asset.symbol}-${index}`} to={`/asset/${asset.symbol}`}>
              <AssetCard asset={asset} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
