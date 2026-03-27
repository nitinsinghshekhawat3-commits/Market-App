import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'INR';

interface AppContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fxRate: number;
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isPro: boolean;
  upgradeToPro: (name: string, email: string) => void;
  updateUserProfile: (name: string, gender: 'male' | 'female') => void;
  uploadAvatar: (file: File) => Promise<boolean>;
  removeAvatar: () => void;
  user: { name: string; email: string; gender?: 'male' | 'female'; avatar?: string } | null;
  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [fxRate, setFxRate] = useState(83.0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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
    const saved = localStorage.getItem('aura_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'BTC-USD', 'RELIANCE.NS'];
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isPro = !!user;

  useEffect(() => {
    fetch('/api/fx')
      .then(res => res.json())
      .then(data => setFxRate(data.rate))
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.avatar) {
      const savedAvatar = localStorage.getItem('aura_user_avatar');
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

  const updateUserProfile = (name: string, gender: 'male' | 'female') => {
    if (user) {
      setUser({ ...user, name, gender });
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
          localStorage.setItem('aura_user_avatar', base64String);
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
      localStorage.removeItem('aura_user_avatar');
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
      user,
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
