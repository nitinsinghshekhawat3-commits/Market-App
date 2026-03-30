'use client';
import { motion } from 'framer-motion';

const metrics = [
  { label: 'BTC', value: '+0.9%', color: 'text-emerald-600' },
  { label: 'NIFTY', value: '-1.0%', color: 'text-rose-500' },
  { label: 'NASDAQ', value: '+0.3%', color: 'text-emerald-600' },
];

export function FloatingCharts() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {metrics.map((item, idx) => (
        <motion.div
          key={item.label}
          className="absolute rounded-2xl border border-green-200/40 bg-white/70 p-3 backdrop-blur-md shadow-sm"
          style={{ width: 110, top: 60 + idx * 78, right: 26 + idx * 22 }}
          initial={{ opacity: 0.15, y: 0 }}
          animate={{ opacity: 0.24, y: [0, -8, 0] }}
          transition={{ duration: 8 + idx * 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="text-xs text-slate-600 font-semibold">{item.label}</p>
          <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
