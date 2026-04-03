import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

export interface AssetOption {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
}

interface SearchInputProps {
  assets: AssetOption[];
  selectedAsset: string;
  onSelect: (asset: AssetOption) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  assets,
  selectedAsset,
  onSelect,
  placeholder = 'Search stocks or crypto (e.g., Apple, Bitcoin, ETH)...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAssets, setFilteredAssets] = useState<AssetOption[]>(assets);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter assets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssets(assets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(query) ||
      asset.symbol.toLowerCase().includes(query) ||
      asset.type.toLowerCase().includes(query)
    );

    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (asset: AssetOption) => {
    onSelect(asset);
    setSearchQuery('');
    setIsOpen(false);
  };

  const { theme } = useApp();
  const selectedAssetName = assets.find(a => a.symbol === selectedAsset)?.name || '';

  return (
    <div ref={containerRef} className="relative w-full">
      <label className={cn('block text-sm font-semibold mb-2', theme === 'dark' ? 'text-slate-200' : 'text-slate-700')}>Search Asset</label>
      
      <div className="relative">
        <Search className={cn('absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none', theme === 'dark' ? 'text-slate-300' : 'text-slate-400')} />
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full rounded-2xl py-3 pl-12 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-400'
              : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500'
          )}
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilteredAssets(assets);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-lg z-50 max-h-72 overflow-y-auto',
          theme === 'dark'
            ? 'bg-slate-950 border border-slate-700 text-slate-100'
            : 'bg-white border border-slate-200 text-slate-900'
        )}>
          {filteredAssets.length > 0 ? (
            <div className="py-2">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelect(asset)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 transition-all text-left border-b last:border-b-0 rounded-lg',
                    theme === 'dark'
                      ? 'hover:!bg-emerald-900/30 border-slate-700 bg-slate-900/80'
                      : 'hover:!bg-emerald-100 border-slate-100 bg-white',
                    selectedAsset === asset.symbol && (theme === 'dark' ? 'bg-emerald-900/30 border-l-4 border-emerald-400' : 'bg-emerald-100 border-l-4 border-emerald-500')
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-bold truncate', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{asset.name}</p>
                    <p className={cn('text-xs font-semibold uppercase truncate', theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>{asset.symbol}</p>
                  </div>
                  <span className={cn(
                    'flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide',
                    theme === 'dark'
                      ? 'border border-emerald-600 text-emerald-100'
                      : 'border border-emerald-200 text-emerald-700',
                    asset.type === 'crypto' ? (theme === 'dark' ? 'bg-emerald-950' : 'bg-emerald-50') : (theme === 'dark' ? 'bg-emerald-950' : 'bg-emerald-50')
                  )}>
                    {asset.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-500 font-medium">No assets found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for Apple, Tesla, Bitcoin, etc.</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Asset Display */}
      {selectedAssetName && !searchQuery && (
        <div className={cn('mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border', theme === 'dark' ? 'bg-slate-800/70 border-slate-600' : 'bg-primary/10 border-primary/20')}>
          <span className={cn('text-xs font-bold uppercase', theme === 'dark' ? 'text-slate-300' : 'text-primary')}>Selected:</span>
          <span className={cn('font-semibold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{selectedAssetName} ({selectedAsset})</span>
        </div>
      )}
    </div>
  );
};
