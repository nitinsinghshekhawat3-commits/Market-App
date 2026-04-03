import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, TrendingUp, TrendingDown, Star, LayoutDashboard, Compass, Newspaper, Menu, X, DollarSign, IndianRupee, BrainCircuit, Camera, Crown, Trash2, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, formatCurrency, formatCompactNumber } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, user, uploadAvatar, removeAvatar, logout, updateUserProfile, theme, setTheme } = useApp();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [animationMode, setAnimationMode] = useState<'basic' | 'advanced'>(() => {
    if (typeof window === 'undefined') return 'basic';
    return (window.localStorage.getItem('marketstock_animation_mode') as 'basic' | 'advanced') || 'basic';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('marketstock_animation_mode', animationMode);
    }
  }, [animationMode]);

  useEffect(() => {
    if (user) {
      setTempName(user.name);
      setTempEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Globe, label: 'Global Sentiment', path: '/global-sentiment' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Star, label: 'Watchlist', path: '/watchlist' },
    { icon: Newspaper, label: 'News', path: '/news' },
    { icon: BrainCircuit, label: 'What-If Simulator', path: '/simulator' },
  ];

  return (
    <>
      <aside className={cn(
          "w-64 h-[calc(100vh-2rem)] backdrop-blur-2xl flex flex-col fixed left-4 top-4 z-50 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] smooth-transition",
          "max-sm:w-52 max-sm:left-2 max-sm:top-2",
          theme === 'dark' ? "bg-slate-900/80 border border-slate-700 text-slate-100" : "bg-white/40 border border-white/40 text-slate-800"
        )}>
        <div className="p-8 flex items-center gap-3 max-sm:p-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-rich max-sm:text-base whitespace-nowrap">Aura <span className="text-primary">Intel</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 max-sm:px-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden smooth-transition max-sm:px-3 max-sm:py-2.5",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                  : theme === 'dark' ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 relative z-10 flex-shrink-0 max-sm:w-4 max-sm:h-4", location.pathname === item.path ? "text-white" : theme === 'dark' ? "text-slate-400 group-hover:text-slate-200" : "text-slate-500 group-hover:text-slate-700")} />
              <span className="relative z-10 max-sm:text-sm">{item.label}</span>
              {location.pathname === item.path && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400 opacity-100 -z-0" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/20">
          {isPro ? (
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center text-center border border-white/50 shadow-lg shadow-primary/5 group hover:shadow-lg hover:shadow-primary/15 transition-all duration-500">
              {/* Avatar and Name Row */}
              <div className="flex items-center gap-3 mb-4 w-full">
                {/* Avatar on Left */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border-2 border-amber-200/30 shadow-lg overflow-hidden">
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
                      <svg className="w-7 h-7 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Name (clickable to open profile menu) */}
                <div className="flex-1 text-left">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen((prev) => !prev); }}
                    className="w-full text-left"
                  >
                    <span className={cn("text-lg font-serif tracking-wide", theme === 'dark' ? "text-white" : "bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-500 bg-clip-text text-transparent") } style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.08em' }}>
                      {user?.name || 'Guest'}
                    </span>
                  </button>
                </div>
              </div>

                {isProfileMenuOpen && (
                  <div ref={profileMenuRef} className={cn("absolute right-0 mt-3 w-64 backdrop-blur-xl rounded-2xl shadow-xl z-50", theme === 'dark' ? "bg-slate-800/95 border border-slate-700" : "bg-white/95 border border-slate-200")}>
                    <div className={cn("p-4 border-b", theme === 'dark' ? "border-slate-700" : "border-slate-200")}>
                      <p className={cn("text-xs uppercase tracking-widest", theme === 'dark' ? "text-slate-400" : "text-slate-400")}>Profile</p>
                      <p className={cn("text-sm font-semibold", theme === 'dark' ? "text-slate-100" : "text-slate-800")}>{user?.name || 'Guest'}</p>
                      {user?.email && <p className={cn("text-xs truncate", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>{user.email}</p>}
                    </div>

                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }} className={cn("w-full text-left px-4 py-3 transition-all", theme === 'dark' ? "hover:bg-slate-700 text-slate-100" : "hover:bg-slate-100 text-slate-800")}>Personal Details</button>
                    <button
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className={cn("w-full text-left px-4 py-3 transition-all flex items-center justify-between", theme === 'dark' ? "hover:bg-slate-700 text-slate-100" : "hover:bg-slate-100 text-slate-800")}
                    >
                      <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} className={cn("w-full text-left px-4 py-3 transition-all", theme === 'dark' ? "hover:bg-slate-700 text-red-400" : "hover:bg-slate-100 text-red-600")}>Logout</button>
                  </div>
                )}

                {/* Pro Member Badge */}
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-100 rounded-full">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  <p className="text-[9px] font-bold text-amber-900 uppercase tracking-widest">Pro Member</p>
                </div>

              {isEditProfileOpen && (
                <div className={cn("absolute inset-x-0 -bottom-60 mx-auto w-11/12 backdrop-blur-xl rounded-2xl shadow-xl p-4 z-50", theme === 'dark' ? "bg-slate-800/95 border border-slate-700" : "bg-white/95 border border-slate-200")}>
                  <div className="flex justify-between items-center mb-3">
                    <p className={cn("text-sm font-bold", theme === 'dark' ? "text-slate-100" : "text-slate-800")}>Personal Details</p>
                    <button className={cn("transition-all", theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600")} onClick={() => setIsEditProfileOpen(false)}>X</button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={cn("text-xs", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>Name</label>
                      <input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className={cn("w-full p-2 border rounded-lg text-sm", theme === 'dark' ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" : "border-slate-300 text-slate-800")}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className={cn("text-xs", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>Email</label>
                      <input
                        value={tempEmail}
                        disabled
                        className={cn("w-full p-2 border rounded-lg text-sm", theme === 'dark' ? "bg-slate-600 border-slate-500 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-400")}
                        placeholder="Email (read-only)"
                      />
                    </div>
                    {user?.phone && (
                      <div>
                        <label className={cn("text-xs", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>Phone</label>
                        <input
                          value={user.phone}
                          disabled
                          className={cn("w-full p-2 border rounded-lg text-sm", theme === 'dark' ? "bg-slate-600 border-slate-500 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-400")}
                          placeholder="Phone number"
                        />
                      </div>
                    )}
                    {user?.provider && (
                      <div>
                        <label className={cn("text-xs", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>Provider</label>
                        <input
                          value={user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                          disabled
                          className={cn("w-full p-2 border rounded-lg text-sm", theme === 'dark' ? "bg-slate-600 border-slate-500 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-400")}
                          placeholder="Login provider"
                        />
                      </div>
                    )}
                    {user?.id && (
                      <div>
                        <label className={cn("text-xs", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>User ID</label>
                        <input
                          value={user.id}
                          disabled
                          className={cn("w-full p-2 border rounded-lg text-sm font-mono text-xs", theme === 'dark' ? "bg-slate-600 border-slate-500 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-400")}
                          placeholder="User ID"
                        />
                      </div>
                    )}
                    <button
                      className={cn("w-full px-3 py-2 rounded-lg transition-all text-sm font-medium", theme === 'dark' ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-emerald-500 text-white hover:bg-emerald-600")}
                      onClick={() => {
                        if (tempName.trim()) {
                          updateUserProfile(tempName.trim(), user?.gender || 'female');
                          setIsEditProfileOpen(false);
                        }
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

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
  const navigate = useNavigate();
  const { currency, setCurrency, fxRate, isPro, showPremiumModal, setShowPremiumModal, user, logout, updateUserProfile, theme, setTheme } = useApp();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return JSON.parse(window.localStorage.getItem('marketstock_notifications_enabled') || 'true');
  });
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  // Initialize temp values when profile menu opens
  useEffect(() => {
    if (user) {
      setTempName(user.name || '');
      setTempEmail(user.email || '');
    }
  }, [user]);

  // Handle clicks outside profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('marketstock_notifications_enabled', JSON.stringify(notificationEnabled));
    }
  }, [notificationEnabled]);

  const avatarInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
      <header className={cn(
        "h-20 backdrop-blur-xl flex items-center justify-between px-8 sticky top-4 z-40 ml-[18rem] mr-4 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",
        theme === 'dark'
          ? 'bg-slate-900/90 border border-slate-700 text-slate-100'
          : 'bg-white/40 border border-white/40 text-slate-900'
      )}>
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
          <div className={cn(
            "absolute top-full mt-3 w-full rounded-[2rem] shadow-2xl border overflow-hidden py-3",
            theme === 'dark'
              ? 'bg-slate-900/95 backdrop-blur-2xl border-slate-700'
              : 'bg-white/80 backdrop-blur-2xl border-white/50'
          )}>
            {results.map((res, index) => (
              <Link
                key={`${res.symbol}-${index}`}
                to={`/asset/${res.symbol}`}
                onClick={() => setSearch('')}
                className={cn(
                  "flex items-center justify-between px-6 py-3.5 hover:bg-primary/5 transition-colors group",
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                <div className="min-w-0">
                  <p className={cn("font-bold transition-colors", theme === 'dark' ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary')}>
                    {res.symbol}
                  </p>
                  <p className={cn(
                    "text-[10px] truncate max-w-[280px] font-medium",
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                  )}>
                    {res.shortname || res.longname}
                  </p>
                </div>
                <span className={cn(
                  "text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider",
                  theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                )}>
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

        <div className="relative">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen((prev) => !prev); }}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700 flex items-center justify-center text-white font-extrabold shadow-lg border border-white/15 hover:scale-105 transition-transform duration-300"
            title="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg">{avatarInitial}</span>
            )}
          </button>

          <div
            ref={profileMenuRef}
            className={cn(
              'absolute right-0 mt-3 w-80 sm:w-96 backdrop-blur-xl rounded-2xl shadow-2xl z-50 transform origin-top-right transition-all duration-300',
              isProfileMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible',
              theme === 'dark'
                ? 'bg-slate-900/95 border border-slate-700'
                : 'bg-white/95 border border-slate-200'
            )}
          >
            <div className={cn('p-4 border-b', theme === 'dark' ? 'border-slate-700' : 'border-slate-200')}>
              <p
                className={cn(
                  'text-2xl font-semibold italic tracking-tight golden-cursive-name',
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                )}
                style={{ fontFamily: '"Great Vibes", cursive', letterSpacing: '0.08em', transform: 'scaleX(1.05)', lineHeight: 1.0 }}
              >
                {user?.name || 'Guest User'}
              </p>
              <p className={cn('text-xs truncate mt-1', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                {user?.email || 'No email available'}
              </p>
            </div>

            <div className="p-3 space-y-1">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate('/profile');
                }}
                className={cn(
                  'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                  theme === 'dark' ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                )}
              >
                Personal Details
              </button>
              <Link
                to="/"
                onClick={() => setIsProfileMenuOpen(false)}
                className={cn(
                  'block rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                  theme === 'dark' ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                )}
              >
                Dashboard
              </Link>

              <div
                className={cn(
                  'rounded-xl border p-3',
                  theme === 'dark' ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
                )}
              >
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition',
                    theme === 'dark'
                      ? 'text-slate-100 bg-slate-800 border border-slate-600 hover:bg-slate-700'
                      : 'text-slate-800 bg-white border border-slate-300 hover:bg-slate-100'
                  )}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </button>
              </div>

              <label
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border p-3',
                  theme === 'dark' ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-white'
                )}
              >
                <span className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-100' : 'text-slate-700')}>
                  Notifications
                </span>
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={() => setNotificationEnabled((prev) => !prev)}
                  className="h-4 w-4 accent-primary"
                />
              </label>



              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className={cn(
                  'w-full rounded-xl px-3 py-2 text-sm font-semibold transition',
                  theme === 'dark' ? 'text-rose-200 bg-rose-900/30 hover:bg-rose-900/40' : 'text-red-600 bg-red-50 hover:bg-red-100'
                )}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={cn(
            'backdrop-blur-xl border rounded-2xl shadow-xl p-6 w-96 max-w-[90vw]',
            theme === 'dark'
              ? 'bg-slate-950/95 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          )}>
            <div className="flex justify-between items-center mb-4">
              <p className={cn('text-lg font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Personal Details</p>
              <button className={cn('transition-all', theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')} onClick={() => setIsEditProfileOpen(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Name</label>
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className={cn(
                    'w-full p-3 border rounded-lg mt-1 outline-none',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  )}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Email</label>
                <input
                  value={tempEmail}
                  disabled
                  className={cn(
                    'w-full p-3 border rounded-lg mt-1',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-300'
                      : 'border-slate-300 bg-slate-100 text-slate-400'
                  )}
                  placeholder="Email (read-only)"
                />
              </div>
              {user?.phone && (
                <div>
                  <label className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>Phone</label>
                  <input
                    value={user.phone}
                    disabled
                    className={cn(
                      'w-full p-3 border rounded-lg mt-1',
                      theme === 'dark'
                        ? 'border-slate-600 bg-slate-800 text-slate-300'
                        : 'border-slate-300 bg-slate-100 text-slate-400'
                    )}
                    placeholder="Phone number"
                  />
                </div>
              )}
              <button
                className={cn(
                  'w-full px-4 py-3 rounded-lg hover:shadow-lg transition-all font-semibold',
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-primary to-accent text-slate-950'
                    : 'bg-gradient-to-r from-primary to-accent text-white'
                )}
                onClick={() => {
                  if (tempName.trim()) {
                    updateUserProfile(tempName.trim(), user?.gender || 'female');
                    setIsEditProfileOpen(false);
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
