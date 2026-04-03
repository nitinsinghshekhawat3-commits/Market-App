import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'INR';

type ThemeMode = 'light' | 'dark';

interface AppContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fxRate: number;
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isPro: boolean;
  upgradeToPro: (name: string, email: string) => void;
  updateUserProfile: (name: string, gender: 'male' | 'female' | 'other') => void;
  uploadAvatar: (file: File) => Promise<boolean>;
  removeAvatar: () => void;
  logout: () => void;
  user: { name: string; email: string; gender?: 'male' | 'female' | 'other'; avatar?: string; phone?: string; provider?: string; id?: string } | null;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [fxRate, setFxRate] = useState(83.0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const preferred = typeof window !== 'undefined' ? (window.localStorage.getItem('marketstock_theme') as ThemeMode | null) : null;
  const system = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initialTheme = (preferred === 'light' || preferred === 'dark' ? preferred : system) || 'light';
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  // Detect user's currency based on browser locale
  useEffect(() => {
    const detectCurrency = () => {
      try {
        const locale = navigator.language || 'en-US';
        const region = new Intl.Locale(locale).region;

        // Set currency based on region
        if (region === 'IN') {
          setCurrency('INR');
        } else {
          setCurrency('USD');
        }
      } catch (error) {
        // Fallback to USD if detection fails
        setCurrency('USD');
      }
    };

    detectCurrency();
  }, []);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['AAPL', 'BTC-USD', 'RELIANCE.NS'];
    const saved = localStorage.getItem('aura_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'BTC-USD', 'RELIANCE.NS'];
  });
  const [user, setUser] = useState<{ name: string; email: string; gender?: 'male' | 'female' | 'other'; avatar?: string; phone?: string; provider?: string; id?: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('marketstock_user_data');
    return saved ? JSON.parse(saved) : null;
  });

  const isPro = !!user;

  // Listen for localStorage changes (for login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'marketstock_user_data') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    // Also check for direct localStorage changes (not through storage event)
    const checkUserData = () => {
      const saved = localStorage.getItem('marketstock_user_data');
      const currentUser = saved ? JSON.parse(saved) : null;
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check every second for localStorage changes (for same-tab updates)
    const interval = setInterval(checkUserData, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    fetch('/api/fx')
      .then(res => res.json())
      .then(data => setFxRate(data.rate))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aura_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('marketstock_user_data', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('marketstock_theme', theme);

    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);

    // Auto-night logic only applies when no explicit pref
    const hasUserChoice = !!localStorage.getItem('marketstock_theme');
    if (!hasUserChoice) {
      const hour = new Date().getHours();
      if (hour >= 19 || hour < 6) {
        setTheme('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && !user.avatar) {
      const savedAvatar = localStorage.getItem('marketstock_user_avatar');
      if (savedAvatar) {
        setUser({ ...user, avatar: savedAvatar });
      }
    }
  }, []);

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const upgradeToPro = (name: string, email: string) => {
    setUser({ name, email, gender: 'female' });
  };

  const updateUserProfile = (name: string, gender: 'male' | 'female' | 'other') => {
    if (user) {
      setUser({ ...user, name, gender });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('marketstock_user', JSON.stringify({ ...user, name, gender }));
      }
    }
  };

  const uploadAvatar = async (file: File): Promise<boolean> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type. Please upload a jpg, png, or webp image.');
      return false;
    }

    // Validate file size (3MB)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File size exceeds 3MB limit.');
      return false;
    }

    try {
      // Convert to base64 with compression
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (user) {
          setUser({ ...user, avatar: base64String });
          if (typeof window !== 'undefined') {
            localStorage.setItem('marketstock_user_avatar', base64String);
          }
        }
      };
      reader.readAsDataURL(file);
      return true;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return false;
    }
  };

  const removeAvatar = () => {
    if (user) {
      setUser({ ...user, avatar: undefined });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('marketstock_user_avatar');
      }
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('marketstock_user_token');
      localStorage.removeItem('marketstock_user_data');
      localStorage.removeItem('marketstock_user_avatar');
    }
  };

  return (
    <AppContext.Provider value={{ 
      currency, 
      setCurrency, 
      fxRate, 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist,
      isPro,
      upgradeToPro,
      updateUserProfile,
      uploadAvatar,
      removeAvatar,
      logout,
      user,
      theme,
      setTheme,
      showPremiumModal,
      setShowPremiumModal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
