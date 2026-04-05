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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

interface TopStock {
  symbol: string;
  price: number;
  change: number;
}

interface SectorData {
  id: string;
  name: string;
  symbol: string;
  change: number;
  marketCap: number;
  displayValue: number;
  topStocks: TopStock[];
  volume: number;
  value?: number; // For Treemap sizing
  [key: string]: any;
}

interface SectorHeatmapProps {
  country?: 'US' | 'IN';
  onDrillDown?: (sector: SectorData) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  country = 'US',
  onDrillDown,
}) => {
  const { theme } = useApp();
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [period, setPeriod] = useState<'1d' | '1w' | '1m' | '3m'>('1d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      setData([]);
      
      const url = `/api/sectors?country=${country}&period=${period}`;
      console.log('Fetching sectors from:', url);
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('Raw API response:', response);
      
      // Handle both response structures: { data: [...] } and direct array
      const rawData = Array.isArray(response) ? response : (response.data || response.sectorData || []);
      console.log('Extracted sector array:', rawData);
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.warn('No sector data received');
        setData([]);
        return;
      }
      
      // Transform API data to include value property for Treemap
      const sectorData = rawData.map((sector: any) => {
        const marketCap = sector.marketCap || sector.value || 1000000000;
        return {
          ...sector,
          value: Math.max(Math.abs(marketCap), 1000000), // Ensure positive value
          displayValue: sector.displayValue || Math.round(marketCap / 1e9),
          change: sector.change || 0,
          name: sector.name || 'Unknown',
          topStocks: sector.topStocks || [],
        };
      });
      
      console.log('Transformed sector data:', sectorData);
      setData(sectorData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching sector data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorData();
    const interval = setInterval(fetchSectorData, 15000); // Auto-refresh every 15 seconds
    return () => clearInterval(interval);
  }, [country, period]);

  const getColor = (change: number): string => {
    if (change >= 2) return theme === 'dark' ? '#059669' : '#10B981'; // Dark green
    if (change > 0) return theme === 'dark' ? '#6EE7B7' : '#A7F3D0'; // Light green
    if (change === 0) return theme === 'dark' ? '#6B7280' : '#D1D5DB'; // Grey
    if (change > -2) return theme === 'dark' ? '#FCA5A5' : '#FECACA'; // Light red
    return theme === 'dark' ? '#DC2626' : '#EF4444'; // Dark red
  };

  const textColor = (change: number): string => {
    return theme === 'dark' ? '#F3F4F6' : '#1F2937';
  };

  const CustomizedContent = (props: any) => {
    const { x, y, width, height } = props;
    // Extract data from payload or direct props
    const data = props.payload || props;
    const change = data?.change ?? 0;
    const name = data?.name ?? 'Unknown';
    const displayValue = data?.displayValue ?? 0;

    if (!x || !y || width < 60 || height < 50) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getColor(change),
            stroke: theme === 'dark' ? '#374151' : '#E5E7EB',
            strokeWidth: 2,
            opacity: hoveredSector === name ? 0.9 : 0.85,
            transition: 'opacity 0.2s',
          }}
          rx={8}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 15}
          textAnchor="middle"
          fill={textColor(change)}
          fontSize={Math.min(14, width / 8)}
          fontWeight="bold"
          pointerEvents="none"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          fill={textColor(change)}
          fontSize={Math.min(16, width / 7)}
          fontWeight="900"
          pointerEvents="none"
        >
          {change >= 0 ? '+' : ''}{Number(change).toFixed(2)}%
        </text>
        <text
          x={x + width / 2}
          y={y + height - 10}
          textAnchor="middle"
          fill={textColor(change)}
          fontSize={Math.min(10, width / 10)}
          opacity={0.7}
          pointerEvents="none"
        >
          ${displayValue}B
        </text>
      </g>
    );
  };

  const topSectors = useMemo(() => {
    return [...data].sort((a, b) => b.change - a.change).slice(0, 3);
  }, [data]);

  const weakestSectors = useMemo(() => {
    return [...data].sort((a, b) => a.change - b.change).slice(0, 3);
  }, [data]);

  const handleSectorClick = (sectorData: SectorData) => {
    setSelectedSector(sectorData);
    onDrillDown?.(sectorData);
  };

  const periodLabels = {
    '1d': '1 Day',
    '1w': '1 Week',
    '1m': '1 Month',
    '3m': '3 Months',
  };

  return (
    <div className={cn(
      'w-full rounded-2xl p-6 transition-all',
      theme === 'dark'
        ? 'bg-slate-900/80 border border-slate-700/50'
        : 'bg-white/70 border border-white/50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            Sector Heatmap
          </h2>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )}>
            {country === 'US' ? 'Global Markets' : 'Indian Markets'} • Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Time Period Filters */}
        <div className="flex gap-2">
          {(Object.keys(periodLabels) as Array<'1d' | '1w' | '1m' | '3m'>).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium text-xs transition-all',
                period === p
                  ? theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-primary/20 text-primary'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white/50 text-slate-600 hover:bg-white/60'
              )}
            >
              {periodLabels[p].split(' ')[0]}
            </button>
          ))}
          <button
            onClick={fetchSectorData}
            disabled={loading}
            className={cn(
              'p-1.5 rounded-lg transition-all',
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

      {/* Main Heatmap */}
      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className={cn(
            'w-8 h-8 animate-spin',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className={cn(
              'text-lg font-semibold mb-2',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            )}>
              No sector data available
            </p>
            <p className={cn(
              'text-sm',
              theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
            )}>
              Try refreshing or check your connection
            </p>
            <button
              onClick={fetchSectorData}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative rounded-lg overflow-hidden mb-6"
          onMouseLeave={() => setHoveredSector(null)}
        >
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={data as any}
              dataKey="value"
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'}
              content={<CustomizedContent />}
              onMouseEnter={(d: any) => setHoveredSector(d?.name ?? null)}
              onClick={(d: any) => {
                if (d?.name) {
                  const sectorData = data.find(s => s.name === d.name);
                  if (sectorData) handleSectorClick(sectorData);
                }
              }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  padding: '12px',
                }}
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }: any) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload || payload[0];
                    return (
                      <div className={cn(
                        'p-3 rounded-lg border',
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-white border-slate-200'
                      )}>
                        <p className={cn(
                          'font-bold mb-2',
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        )}>
                          {data?.name || 'Unknown'}
                        </p>
                        <p className={cn(
                          'text-sm',
                          (data?.change ?? 0) >= 0 ? 'text-primary' : 'text-negative'
                        )}>
                          Change: {(data?.change ?? 0) >= 0 ? '+' : ''}{Number(data?.change ?? 0).toFixed(2)}%
                        </p>
                        <p className={cn(
                          'text-sm',
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        )}>
                          Market Cap: ${data?.displayValue ?? 0}B
                        </p>
                        {data?.topStocks?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className={cn(
                              'text-xs font-semibold mb-1',
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                            )}>
                              Top Stocks:
                            </p>
                            {data.topStocks.map((stock: TopStock) => (
                              <p key={stock.symbol} className={cn(
                                'text-xs',
                                stock.change >= 0 ? 'text-primary' : 'text-negative'
                              )}>
                                {stock.symbol}: {stock.change >= 0 ? '+' : ''}{Number(stock.change).toFixed(2)}%
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className={cn(
          'p-4 rounded-xl border',
          theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700/50'
            : 'bg-green-50/50 border-green-200/50'
        )}>
          <h3 className={cn(
            'font-bold text-sm mb-3 flex items-center gap-2',
            theme === 'dark' ? 'text-primary' : 'text-primary'
          )}>
            <TrendingUp className="w-4 h-4" />
            Top 3 Sectors
          </h3>
          <div className="space-y-2">
            {topSectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center justify-between text-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleSectorClick(sector)}
              >
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                  {sector.name}
                </span>
                <span className="text-primary font-semibold">
                  {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div className={cn(
          'p-4 rounded-xl border',
          theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700/50'
            : 'bg-red-50/50 border-red-200/50'
        )}>
          <h3 className={cn(
            'font-bold text-sm mb-3 flex items-center gap-2',
            theme === 'dark' ? 'text-negative' : 'text-negative'
          )}>
            <TrendingDown className="w-4 h-4" />
            Weakest 3 Sectors
          </h3>
          <div className="space-y-2">
            {weakestSectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center justify-between text-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleSectorClick(sector)}
              >
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                  {sector.name}
                </span>
                <span className="text-negative font-semibold">
                  {sector.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSector(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                'rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto',
                theme === 'dark'
                  ? 'bg-slate-900 border border-slate-700'
                  : 'bg-white border border-slate-200'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn(
                  'text-xl font-bold',
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  {selectedSector.name}
                </h3>
                <button
                  onClick={() => setSelectedSector(null)}
                  className={cn(
                    'p-1 rounded-lg transition-all',
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={cn(
                      'text-xs font-semibold',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Performance
                    </p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      selectedSector.change >= 0 ? 'text-primary' : 'text-negative'
                    )}>
                      {selectedSector.change >= 0 ? '+' : ''}{selectedSector.change.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className={cn(
                      'text-xs font-semibold',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Market Cap
                    </p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      ${selectedSector.displayValue}B
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className={cn(
                    'font-semibold mb-3',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    Top Stocks
                  </h4>
                  <div className="space-y-2">
                    {selectedSector.topStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className={cn(
                          'p-3 rounded-lg flex items-center justify-between border',
                          theme === 'dark'
                            ? 'bg-slate-800/50 border-slate-700/50'
                            : 'bg-slate-50 border-slate-200'
                        )}
                      >
                        <div>
                          <p className={cn(
                            'font-semibold',
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          )}>
                            {stock.symbol}
                          </p>
                          <p className={cn(
                            'text-xs',
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                          )}>
                            ${stock.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-negative" />
                          )}
                          <span className={cn(
                            'font-semibold text-sm',
                            stock.change >= 0 ? 'text-primary' : 'text-negative'
                          )}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
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
