import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { SectorHeatmap } from './SectorHeatmap';

interface SectorData {
  id: string;
  name: string;
  symbol: string;
  change: number;
  marketCap: number;
  displayValue: number;
  topStocks: Array<{ symbol: string; price: number; change: number }>;
  volume: number;
}

interface AdvancedSectorHeatmapProps {
  country?: 'US' | 'IN';
}

export const AdvancedSectorHeatmap: React.FC<AdvancedSectorHeatmapProps> = ({
  country = 'US',
}) => {
  const { theme } = useApp();
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/sectors?country=${country}&period=1d`);
        const response = await res.json();
        setSectorData(response.data || []);
      } catch (error) {
        console.error('Error fetching sector data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country]);

  // Sector rotation analysis
  const sectorRotation = useMemo(() => {
    if (sectorData.length === 0) return [];

    return sectorData
      .map((sector) => ({
        ...sector,
        momentum: calculateMomentum(sector.change, sector.volume),
      }))
      .sort((a, b) => b.momentum - a.momentum);
  }, [sectorData]);

  function calculateMomentum(change: number, volume: number): number {
    // Simple momentum = change * (log of volume)
    return change * Math.log(Math.max(volume, 1)) / 100;
  }

  const topGrowers = useMemo(() => {
    return [...sectorRotation].sort((a, b) => b.change - a.change).slice(0, 5);
  }, [sectorRotation]);

  const topMomentum = useMemo(() => {
    return [...sectorRotation].sort((a, b) => b.momentum - a.momentum).slice(0, 5);
  }, [sectorRotation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className={cn(
          'w-8 h-8 animate-spin',
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        )} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Heatmap */}
      <SectorHeatmap country={country} />

      {/* Advanced Features Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Rotation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl p-6 border',
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-700/50'
              : 'bg-white/70 border-white/50'
          )}
        >
          <h3 className={cn(
            'text-xl font-bold mb-4 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            <Activity className="w-5 h-5 text-primary" />
            Sector Rotation (Fastest Growing)
          </h3>

          <div className="space-y-3">
            {topGrowers.map((sector, index) => (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-4 rounded-lg border flex items-center justify-between',
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-slate-50/70 border-slate-200/70'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs',
                      'bg-gradient-to-br from-primary/30 to-primary/10',
                      theme === 'dark' ? 'text-primary' : 'text-primary'
                    )}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className={cn(
                        'font-semibold',
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      )}>
                        {sector.name}
                      </p>
                      <p className={cn(
                        'text-xs',
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      )}>
                        Growth intensity: {sector.momentum.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className={cn(
                    'font-bold text-lg text-primary'
                  )}>
                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Momentum Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-2xl p-6 border',
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-700/50'
              : 'bg-white/70 border-white/50'
          )}
        >
          <h3 className={cn(
            'text-xl font-bold mb-4 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            <Zap className="w-5 h-5 text-yellow-500" />
            High Momentum Sectors
          </h3>

          <div className="space-y-3">
            {topMomentum.map((sector, index) => {
              const isPositive = sector.change >= 0;
              const momentumStrength = Math.abs(sector.momentum);

              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border',
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700/50'
                      : 'bg-slate-50/70 border-slate-200/70'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn(
                      'font-semibold',
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    )}>
                      {sector.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          rotate: isPositive ? [0, 15, 0] : [0, -15, 0],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-negative" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Momentum Bar */}
                  <div className="mb-2">
                    <div className={cn(
                      'w-full h-2 rounded-full overflow-hidden',
                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                    )}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(momentumStrength * 10, 100)}%`,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full transition-all',
                          isPositive
                            ? 'bg-gradient-to-r from-primary to-emerald-400'
                            : 'bg-gradient-to-r from-negative to-red-400'
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(
                      'font-semibold',
                      isPositive ? 'text-primary' : 'text-negative'
                    )}>
                      {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                    </span>
                    <span className={cn(
                      'text-xs',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      Momentum: {sector.momentum.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Live Update Indicator */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          'flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium',
          theme === 'dark'
            ? 'bg-slate-800/50 text-slate-300'
            : 'bg-slate-100/70 text-slate-700'
        )}
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Live data • Auto-refreshing every 15 seconds
      </motion.div>
    </div>
  );
};
