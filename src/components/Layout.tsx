import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, TrendingUp, TrendingDown, Star, LayoutDashboard, Compass, Newspaper, Settings, Menu, X, DollarSign, IndianRupee, User, LogOut, BrainCircuit, Camera, Crown, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, formatCurrency, formatCompactNumber } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { UpgradeModal } from './UpgradeModal';

// Import Google Font for Serif/Calligraphy style (add to CSS/Tailwind)
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Great+Vibes&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector('link[href*="fonts.googleapis"]')) {
    document.head.appendChild(link);
  }
}

export const Sidebar = () => {
  const location = useLocation();
  const { isPro, user, uploadAvatar, removeAvatar } = useApp();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file. Please upload jpg, png, or webp.');
      return;
    }

    // Validate file size
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 3MB.');
      return;
    }

    const success = await uploadAvatar(file);
    if (!success) {
      setUploadError('Failed to upload avatar.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Globe, label: 'Global Sentiment', path: '/global-sentiment' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Star, label: 'Watchlist', path: '/watchlist' },
    { icon: Newspaper, label: 'News', path: '/news' },
    { icon: BrainCircuit, label: 'What-If Simulator', path: '/simulator' },
  ];

  return (
    <>
      <aside className="w-64 h-[calc(100vh-2rem)] bg-white/40 backdrop-blur-2xl border border-white/40 flex flex-col fixed left-4 top-4 z-50 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-rich">Aura <span className="text-primary">Intel</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 relative z-10", location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="relative z-10">{item.label}</span>
              {location.pathname === item.path && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400 opacity-100" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/20">
          {isPro ? (
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center text-center border border-white/50 shadow-lg shadow-primary/5 group hover:shadow-lg hover:shadow-primary/15 transition-all duration-500">
              {/* Avatar with Glow Effect and Upload Button */}
              <div className="relative mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border-2 border-amber-200/30 shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : user?.gender === 'male' ? (
                    <svg className="w-10 h-10 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                
                {/* Edit/Upload Icon Overlay */}
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Delete Avatar Button */}
                {user?.avatar && (
                  <button
                    onClick={removeAvatar}
                    className="absolute bottom-0 left-0 bg-negative rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                    title="Delete profile photo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              </div>
              
              {/* Premium Name with Gold Gradient */}
              <p className="text-lg font-serif tracking-wide mb-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-500 bg-clip-text text-transparent group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-500" style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.08em' }}>
                {user?.name || 'Guest'}
              </p>
              
              {/* Pro Member Badge */}
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                <p className="text-[9px] font-bold text-amber-900 uppercase tracking-widest">Pro Member</p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <p className="text-[9px] text-red-500 mt-2 text-center">{uploadError}</p>
              )}
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pro Plan</p>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">Unlock advanced AI insights and real-time alerts.</p>
              <button 
                onClick={() => setIsUpgradeOpen(true)}
                className="w-full py-3 bg-text-rich text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </aside>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </>
  );
};

export const Topbar = () => {
  const { currency, setCurrency, fxRate, isPro, showPremiumModal, setShowPremiumModal } = useApp();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
      fetch(`/api/search?q=${search}`)
          .then(res => res.json())
          .then(data => setResults(data))
          .catch(() => {});
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl border border-white/40 flex items-center justify-between px-8 sticky top-4 z-40 ml-[18rem] mr-4 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search stocks, crypto, indices..."
          className="w-full bg-white/50 border border-white/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="absolute top-full mt-3 w-full bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden py-3">
            {results.map((res, index) => (
              <Link
                key={`${res.symbol}-${index}`}
                to={`/asset/${res.symbol}`}
                onClick={() => setSearch('')}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-primary/5 transition-colors group"
              >
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{res.symbol}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[200px] font-medium">{res.shortname || res.longname}</p>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-500 uppercase tracking-wider">
                  {res.quoteType}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Currency Toggle */}
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/50">
          <button
            onClick={() => setCurrency('USD')}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              currency === 'USD' ? "bg-white text-primary shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" /> USD
          </button>
          <button
            onClick={() => setCurrency('INR')}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              currency === 'INR' ? "bg-white text-primary shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <IndianRupee className="w-3.5 h-3.5" /> INR
          </button>
        </div>
        
        {/* PRO Button - Now a button that opens modal */}
        <button
          onClick={() => setShowPremiumModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 uppercase tracking-widest',
            isPro
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl'
              : 'bg-white/60 border border-white/80 text-slate-600 hover:bg-white/80'
          )}
        >
          <Crown className={cn('w-4 h-4', isPro ? 'fill-white' : '')} />
          PRO
        </button>
        
        {/* Profile Avatar */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg shadow-primary/20">
          <div className="w-full h-full rounded-[0.85rem] bg-white flex items-center justify-center overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};
