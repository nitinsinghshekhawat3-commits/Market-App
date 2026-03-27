import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

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

  const selectedAssetName = assets.find(a => a.symbol === selectedAsset)?.name || '';

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Search Asset</label>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 pl-12 pr-10 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg z-50 max-h-72 overflow-y-auto">
          {filteredAssets.length > 0 ? (
            <div className="py-2">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelect(asset)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-slate-100 last:border-b-0',
                    selectedAsset === asset.symbol && 'bg-primary/10'
                  )}
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{asset.name}</p>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{asset.symbol}</p>
                  </div>
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-lg',
                    asset.type === 'crypto'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
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
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
          <span className="text-xs font-bold text-primary uppercase">Selected:</span>
          <span className="font-semibold text-slate-900">{selectedAssetName} ({selectedAsset})</span>
        </div>
      )}
    </div>
  );
};
