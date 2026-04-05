
import React, { useState, useEffect, useMemo } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  ZoomIn,
  RefreshCw,
  Loader2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { getApiUrl } from '../lib/apiConfig';
import { analyzeAsset, explainChart } from '../services/aiService';

// SECTOR BUTTONS
const SECTOR_ALL = 'All';
const SECTORS = ['Banking', 'IT', 'Pharma', 'FMCG', 'Auto', 'Energy', 'Metal', 'Infra'];
const SECTOR_OPTIONS = [SECTOR_ALL, ...SECTORS];

interface Stock {
  symbol: string;
  fullSymbol: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
  name: string;
}

interface Sector {
  name: string;
  stocks: Stock[];
  change: number;
  marketCap: number;
  gainers: number;
  losers: number;
}

interface ApiResponse {
  sectors: Record<string, Sector>;
  timestamp: string;
}

export const IndianStockHeatmap: React.FC = () => {
  const { theme } = useApp();
  const [allSectorsData, setAllSectorsData] = useState<Record<string, Sector>>({});
  const [selectedSector, setSelectedSector] = useState<string>(SECTOR_ALL);
  const [aiSector, setAiSector] = useState<string>('Banking');
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<'treemap' | 'table'>('treemap');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  const fetchIndiaData = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/india-heatmap'));
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const response: ApiResponse = await res.json();
      setAllSectorsData(response.sectors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching India heatmap data:', error);
      setAllSectorsData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndiaData();
  }, []);

  useEffect(() => {
    if (selectedSector !== SECTOR_ALL && Object.keys(allSectorsData).length > 0 && !allSectorsData[selectedSector]) {
      const firstSector = Object.keys(allSectorsData)[0];
      if (firstSector) {
        setSelectedSector(firstSector);
      }
    }
  }, [allSectorsData, selectedSector]);

  const getStockColor = (change: number): string => {
    if (change > 2) return theme === 'dark' ? '#059669' : '#10B981';
    if (change > 0) return theme === 'dark' ? '#6EE7B7' : '#A7F3D0';
    if (change === 0) return theme === 'dark' ? '#6B7280' : '#D1D5DB';
    if (change > -2) return theme === 'dark' ? '#FCA5A5' : '#FECACA';
    return theme === 'dark' ? '#DC2626' : '#EF4444';
  };

  const getGlowColor = (change: number): string => {
    if (change > 0) return 'rgba(5, 150, 105, 0.5)';
    if (change < 0) return 'rgba(220, 38, 38, 0.5)';
    return 'rgba(107, 114, 128, 0.2)';
  };

  const textColor = theme === 'dark' ? '#F3F4F6' : '#1F2937';

  const currentSectorData = selectedSector === SECTOR_ALL ? null : allSectorsData[selectedSector];

  const sectorList = useMemo(() => {
    return Object.values(allSectorsData).map((sector) => ({
      ...sector,
      momentum: (sector.change || 0) * Math.log(Math.max(sector.marketCap, 1)) / 100,
    }));
  }, [allSectorsData]);

  const topSectors = useMemo(() => {
    return [...sectorList].sort((a, b) => (b.change || 0) - (a.change || 0)).slice(0, 3);
  }, [sectorList]);

  const weakestSectors = useMemo(() => {
    return [...sectorList].sort((a, b) => (a.change || 0) - (b.change || 0)).slice(0, 3);
  }, [sectorList]);

  const rotationSectors = useMemo(() => {
    return [...sectorList].sort((a, b) => (b.change || 0) - (a.change || 0)).slice(0, 3);
  }, [sectorList]);

  const highMomentumSectors = useMemo(() => {
    return [...sectorList].sort((a, b) => (b.momentum || 0) - (a.momentum || 0)).slice(0, 3);
  }, [sectorList]);

  const orderedSectorNames = useMemo(() => {
    const sectorPriority = ['Technology', 'Banking', 'IT', 'Pharma', 'FMCG', 'Auto', 'Energy', 'Metal', 'Infra'];
    const existing = Object.keys(allSectorsData);
    const prioritized = sectorPriority.filter((s) => existing.includes(s));
    const remaining = existing.filter((s) => !sectorPriority.includes(s));
    const finalOrder = [...prioritized, ...remaining];

    // limit to at most 8 to keep layout consistent
    return finalOrder.slice(0, 8);
  }, [allSectorsData]);

  const getTileSpan = (marketCap: number, min: number, max: number) => {
    if (max === min) return { colSpan: 1, rowSpan: 1 };
    const normalized = (marketCap - min) / (max - min);
    if (normalized > 0.8) return { colSpan: 2, rowSpan: 2 };
    if (normalized > 0.6) return { colSpan: 2, rowSpan: 1 };
    return { colSpan: 1, rowSpan: 1 };
  };

  const aiTopPicksBySector = useMemo(() => {
    const result: Record<string, Stock[]> = {};
    sectorList.forEach((sector) => {
      const sortedByScore = (sector.stocks || [])
        .sort((a, b) => {
          const scoreA = (a.change || 0) * Math.log10(Math.max(a.marketCap || 1, 1));
          const scoreB = (b.change || 0) * Math.log10(Math.max(b.marketCap || 1, 1));
          return scoreB - scoreA;
        })
        .slice(0, 3);
      result[sector.name] = sortedByScore;
    });
    return result;
  }, [sectorList]);

  const runAiAnalysis = async () => {
    const picks = aiTopPicksBySector[aiSector] || [];
    if (picks.length === 0) {
      setAiError('No AI picks available for selected sector.');
      return;
    }

    const primary = picks[0];
    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);

    try {
      const analysis = await analyzeAsset(primary.symbol, {
        price: primary.price,
        change: primary.change,
        marketCap: primary.marketCap,
        volume: primary.volume,
        summary: `Top stock in ${aiSector} sector for AI analysis`,
      }, 'INR');

      // Optional chart explanation call (best effort), uses top 10 stocks chart data if available
      const chartExplanation = await explainChart(primary.symbol, stocksData.slice(0, 10).map(stock => ({
        time: stock.symbol,
        value: stock.price,
      })), 'INR').catch(() => 'Chart explanation unavailable.');

      setAiInsights(`AI analysis for ${primary.symbol}:
${analysis}

Chart insights:
${chartExplanation}`);
    } catch (err: any) {
      setAiError('AI analysis failed. Try again.');
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const stocksData = useMemo(() => {
    if (selectedSector === SECTOR_ALL) {
      const allStocks = Object.values(allSectorsData)
        .flatMap((sector) => sector.stocks.slice(0, 25).map((stock, idx) => ({
          id: `all-${sector.name}-${stock.symbol}-${idx}`,
          name: stock.symbol,
          value: Math.max(stock.marketCap || 100000000, 50000000),
          symbol: stock.symbol,
          fullSymbol: stock.fullSymbol || stock.symbol,
          sector: sector.name,
          price: stock.price,
          change: Number(stock.change) || 0,
          marketCap: stock.marketCap,
          volume: stock.volume,
          fullName: stock.name || stock.symbol,
        })));

      return allStocks;
    }

    if (!currentSectorData?.stocks) return [];
    
    const mapped = currentSectorData.stocks.slice(0, 25).map((stock, idx) => ({
      id: `${selectedSector}-${stock.symbol}-${idx}`,
      name: stock.symbol,
      value: Math.max(stock.marketCap || 100000000, 50000000),
      symbol: stock.symbol,
      fullSymbol: stock.fullSymbol || stock.symbol,
      price: stock.price,
      change: Number(stock.change) || 0,
      marketCap: stock.marketCap,
      volume: stock.volume,
      fullName: stock.name || stock.symbol,
      sector: selectedSector,
    }));

    return mapped;
  }, [allSectorsData, currentSectorData, selectedSector]);

  const renderStockTiles = (stocks: any[]) => {
    const selectedStocks = stocks.slice(0, 12);
    const caps = selectedStocks.map((s) => s.marketCap || 0);
    const minCap = caps.length ? Math.min(...caps) : 0;
    const maxCap = caps.length ? Math.max(...caps) : 0;

    return selectedStocks.map((stock) => {
      const { colSpan, rowSpan } = getTileSpan(stock.marketCap || 0, minCap, maxCap);
      return (
        <button
          key={stock.id}
          onClick={() => setSelectedStock({
            symbol: stock.symbol,
            fullSymbol: stock.fullSymbol || stock.symbol,
            price: stock.price,
            change: stock.change,
            marketCap: stock.marketCap,
            volume: stock.volume,
            name: stock.name || stock.symbol,
          })}
          className={cn(
            'rounded p-1 text-left transition shadow-sm',
            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
          )}
          style={{
            backgroundColor: getStockColor(stock.change),
            gridColumn: `span ${colSpan}`,
            gridRow: `span ${rowSpan}`,
          }}
        >
          <p className="text-xs font-bold text-black/80 dark:text-white">{stock.symbol}</p>
          <p className="text-[10px] mt-0.5 text-black/60 dark:text-slate-200">₹{stock.price.toFixed(2)}</p>
          <p className="text-[10px] mt-0.5 font-semibold" style={{ color: stock.change >= 0 ? '#065f46' : '#b91c1c' }}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </p>
        </button>
      );
    });
  };

  // Debugging: ensure we have data ready
  useEffect(() => {
    console.log('IndianStockHeatmap: selectedSector=', selectedSector, 'stocks=', stocksData.length, 'loading=', loading);
    console.log('IndianStockHeatmap currentSectorData=', currentSectorData);
  }, [selectedSector, stocksData.length, loading, currentSectorData]);

  const StockBlock = (props: any) => {
    const { x, y, width, height, payload } = props;

    if (!payload || width <= 0 || height <= 0) return null;

    const changeValue = payload.change || 0;
    const isHovered = hoveredStock === payload.id;

    return (
      <g
        key={payload.id}
        onClick={() => {
          const stock = currentSectorData?.stocks.find(s => s.symbol === payload.symbol);
          if (stock) setSelectedStock(stock);
        }}
        onMouseEnter={() => setHoveredStock(payload.id)}
        onMouseLeave={() => setHoveredStock(null)}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={getStockColor(changeValue)}
          stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
          strokeWidth={1}
          opacity={isHovered ? 0.95 : 0.85}
          rx={3}
          style={{
            filter: advancedMode && isHovered ? `drop-shadow(0 0 8px ${getGlowColor(changeValue)})` : 'none',
            transition: 'all 0.2s ease',
          }}
        />

        {width > 40 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 6}
              textAnchor="middle"
              fill={textColor}
              fontSize={Math.min(11, width / 5.5)}
              fontWeight="bold"
              pointerEvents="none"
            >
              {payload.symbol}
            </text>

            <text
              x={x + width / 2}
              y={y + height / 2 + 9}
              textAnchor="middle"
              fill={textColor}
              fontSize={Math.min(13, width / 4.5)}
              fontWeight="900"
              pointerEvents="none"
            >
              {changeValue > 0 ? '+' : ''}{changeValue.toFixed(2)}%
            </text>
          </>
        )}

        {width > 75 && (
          <text
            x={x + width / 2}
            y={y + height - 5}
            textAnchor="middle"
            fill={textColor}
            fontSize={Math.min(8, width / 7)}
            opacity={0.7}
            pointerEvents="none"
          >
            ₹{(payload.price || 0).toFixed(0)}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={cn(
      'w-full rounded-2xl p-6 transition-all',
      theme === 'dark'
        ? 'bg-slate-900/80 border border-slate-700/50'
        : 'bg-white/70 border border-white/50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn(
            'text-2xl font-bold flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            <ZoomIn className="w-6 h-6" />
            {selectedSector === SECTOR_ALL ? 'All Sectors' : `${selectedSector} • NSE Top 25 Stocks`}
          </h2>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )}>
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
          <p className={cn(
            'text-xs mt-1',
            theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
          )}>
            {selectedSector === SECTOR_ALL
              ? `Showing ${stocksData.length} stocks (top 25 per sector)`
              : `Showing ${stocksData.length} / 25 stocks in ${selectedSector}`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={cn(
              'px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1',
              advancedMode
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white/50 text-slate-600 hover:bg-white/60'
            )}
          >
            <Zap className="w-3 h-3" />
            {advancedMode ? ' Advanced' : 'Normal'}
          </button>

          <button
            onClick={fetchIndiaData}
            disabled={loading}
            className={cn(
              'p-2 rounded-lg transition-all',
              theme === 'dark'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white/50 text-slate-600 hover:bg-white/60',
              loading && 'opacity-50'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setDisplayMode('treemap')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            displayMode === 'treemap'
              ? 'bg-green-600 text-white'
              : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          Treemap
        </button>
        <button
          onClick={() => setDisplayMode('table')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            displayMode === 'table'
              ? 'bg-green-600 text-white'
              : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          Table
        </button>
      </div>

      {/* Sector Selector - IMPORTANT */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SECTOR_OPTIONS.map((sector) => (
          <button
            key={sector}
            onClick={() => {
              setSelectedSector(sector);
              if (sector !== SECTOR_ALL) {
                setAiSector(sector);
              }
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              selectedSector === sector
                ? theme === 'dark'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-green-500 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Heatmap Container */}
      {loading && stocksData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className={cn(
            'w-8 h-8 animate-spin',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )} />
        </div>
      ) : stocksData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className={cn(
              'text-lg font-semibold mb-2',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            )}>
              No stocks available for {selectedSector}
            </p>
            <button
              onClick={fetchIndiaData}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : displayMode === 'table' ? (
        <div className={cn(
          'overflow-x-auto rounded-lg p-3 border',
          theme === 'dark' ? 'bg-slate-900/60 border-slate-700' : 'bg-white/70 border-slate-200'
        )}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={cn(theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                <th className="px-3 py-2">#</th>
                {selectedSector === SECTOR_ALL && <th className="px-3 py-2">Sector</th>}
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Change</th>
                <th className="px-3 py-2">Market Cap (₹B)</th>
                <th className="px-3 py-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {stocksData.map((stock, idx) => (
                <tr key={stock.id} className={idx % 2 === 0 ? 'bg-white/10' : ''}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  {selectedSector === SECTOR_ALL && <td className="px-3 py-2">{stock.sector}</td>}
                  <td className="px-3 py-2 font-semibold">{stock.symbol}</td>
                  <td className="px-3 py-2">₹{stock.price.toFixed(2)}</td>
                  <td className={cn(
                    'px-3 py-2 font-bold',
                    stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2">{((stock.marketCap || 0)/1e9).toFixed(2)}</td>
                  <td className="px-3 py-2">{(stock.volume || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedSector === SECTOR_ALL ? (
            <div className={cn(
              'rounded-xl border p-3',
              theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white/90'
            )} style={{ overflow: 'hidden' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={cn('font-bold text-sm', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  All Sectors • {stocksData.length} stocks
                </h3>
                <p className={cn('text-xs font-semibold', theme === 'dark' ? 'text-slate-200' : 'text-slate-500')}>
                  {orderedSectorNames.length} sectors
                </p>
              </div>

              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {orderedSectorNames.map((sectorName) => {
                  const sector = allSectorsData[sectorName];
                  if (!sector) return null;

                  const sectorStocks = sector.stocks.slice(0, 12);
                  const caps = sectorStocks.length ? sectorStocks.map((s: any) => s.marketCap || 0) : [0, 1];
                  const minCap = Math.min(...caps);
                  const maxCap = Math.max(...caps);

                  return (
                    <div
                      key={sectorName}
                      className={cn(
                        'rounded-lg border p-0 h-[360px] overflow-hidden',
                        theme === 'dark'
                          ? 'border-slate-700 bg-slate-900/80'
                          : 'border-slate-200 bg-white/95'
                      )}
                    >
                      <div className="mb-0.5 flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-blue-500">{sectorName}</span>
                        <span className="text-[10px] text-slate-500">{sectorStocks.length}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-[2px] auto-rows-[50px] auto-flow-dense">                        {sectorStocks.map((stock) => {
                          const { colSpan, rowSpan } = getTileSpan(stock.marketCap || 0, minCap, maxCap);
                          return (
                            <button
                              key={stock.symbol}
                              onClick={() => setSelectedStock({
                                symbol: stock.symbol,
                                fullSymbol: stock.fullSymbol || stock.symbol,
                                price: stock.price,
                                change: stock.change,
                                marketCap: stock.marketCap,
                                volume: stock.volume,
                                name: stock.name || stock.symbol,
                              })}
                              className={cn(
                                'rounded p-1 text-left overflow-hidden text-[10px] font-semibold',
                                theme === 'dark' ? 'border border-slate-700' : 'border border-slate-200'
                              )}
                              style={{
                                backgroundColor: getStockColor(stock.change),
                                gridColumn: `span ${colSpan}`,
                                gridRow: `span ${rowSpan}`,
                              }}
                            >
                              <div className="leading-tight">{stock.symbol}</div>
                              <div className="text-[9px] mt-0.5">₹{stock.price.toFixed(2)}</div>
                              <div className="text-[9px]" style={{ color: stock.change >= 0 ? '#065f46' : '#b91c1c' }}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={cn(
              'rounded-xl border p-3',
              theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white/80'
            )}>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gridAutoRows: 'minmax(72px, auto)' }}>
                {renderStockTiles(stocksData)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sector Metrics Summary -> moved below treemap / table */}
      {!loading && sectorList.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl p-4 border bg-slate-900/70 border-slate-700/60">
            <h3 className="text-lg font-bold text-white mb-3">Top 3 Sectors</h3>
            <ul className="space-y-2">
              {topSectors.map((sector, i) => (
                <li key={`top-${i}`} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-sm text-white">#{i + 1} {sector.name}</span>
                  <span className="text-sm font-semibold text-emerald-300">{sector.change >= 0 ? '+' : ''}{sector.change?.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-4 border bg-slate-900/70 border-slate-700/60">
            <h3 className="text-lg font-bold text-white mb-3">Weakest 3 Sectors</h3>
            <ul className="space-y-2">
              {weakestSectors.map((sector, i) => (
                <li key={`weak-${i}`} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-sm text-white">#{i + 1} {sector.name}</span>
                  <span className="text-sm font-semibold text-red-300">{sector.change >= 0 ? '+' : ''}{sector.change?.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-4 border bg-slate-900/70 border-slate-700/60">
            <h3 className="text-lg font-bold text-white mb-3">Sector Rotation (Fastest Growing)</h3>
            <ul className="space-y-2">
              {rotationSectors.map((sector, i) => (
                <li key={`rotation-${i}`} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-sm text-white">#{i + 1} {sector.name}</span>
                  <span className="text-sm font-semibold text-primary">Momentum {sector.momentum?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-4 border bg-slate-900/70 border-slate-700/60">
            <h3 className="text-lg font-bold text-white mb-3">High Momentum Sectors</h3>
            <ul className="space-y-2">
              {highMomentumSectors.map((sector, i) => (
                <li key={`momentum-${i}`} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-sm text-white">#{i + 1} {sector.name}</span>
                  <span className="text-sm font-semibold text-amber-300">{sector.momentum?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && sectorList.length > 0 && (
        <div className="mb-6 rounded-2xl p-4 border bg-slate-900/70 border-slate-700/60">
          <h3 className="text-lg font-bold text-white mb-3">AI-Selected Top 3 Stocks to Buy</h3>
          <div className="mb-3 flex items-center gap-2">
            <label className="text-sm text-slate-200">Select sector:</label>
            <select
              value={aiSector}
              onChange={(e) => setAiSector(e.target.value)}
              className="rounded-lg px-3 py-1 text-sm bg-slate-800 text-white border border-slate-700"
            >
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectedSector(aiSector)}
              className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs"
            >
              Show Sector
            </button>
          </div>

          <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-2">{aiSector} picks</h4>
            <ul className="space-y-1">
              {(aiTopPicksBySector[aiSector] || []).map((stock, i) => (
                <li key={`${aiSector}-${stock.symbol}`} className="flex justify-between items-center text-sm text-slate-100">
                  <span>{i + 1}. {stock.symbol}</span>
                  <span className="font-semibold text-emerald-300">{stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button
                onClick={runAiAnalysis}
                disabled={aiLoading}
                className={cn(
                  'px-3 py-2 rounded-lg font-semibold text-sm',
                  aiLoading
                    ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                )}
              >
                {aiLoading ? 'Running AI...' : `AI Analyze ${aiSector}`}
              </button>
            </div>

            {aiError && (
              <p className="mt-3 text-sm text-red-400">{aiError}</p>
            )}

            {aiInsights && (
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-xs text-slate-100 whitespace-pre-wrap">
                {aiInsights}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStock(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                'rounded-2xl p-6 max-w-md w-full',
                theme === 'dark'
                  ? 'bg-slate-900 border border-slate-700'
                  : 'bg-white border border-slate-200'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={cn(
                    'text-2xl font-bold',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    {selectedStock.symbol}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {selectedStock.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className={cn(
                    'p-2 rounded-lg',
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={cn(
                      'text-xs font-semibold',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Price
                    </p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      ₹{selectedStock.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={cn(
                      'text-xs font-semibold',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Change
                    </p>
                    <p className={cn(
                      'text-2xl font-bold mt-1 flex items-center gap-1',
                      selectedStock.change > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {selectedStock.change > 0 ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                      {selectedStock.change > 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className={cn(
                  'p-4 rounded-lg border',
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-slate-50 border-slate-200'
                )}>
                  <div className="flex justify-between mb-2">
                    <span className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Market Cap
                    </span>
                    <span className={cn(
                      'font-bold',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      ₹{(selectedStock.marketCap / 1e9).toFixed(1)}B
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Volume
                    </span>
                    <span className={cn(
                      'font-bold',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      {(selectedStock.volume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndianStockHeatmap;
