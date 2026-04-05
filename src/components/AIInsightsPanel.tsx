import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const messages = [  'AI Predicting Markets...',
  'Analyzing Global Trends...',
  'Generating Signals...',
  'Optimizing risk/reward profiles...',
  'Syncing global liquidity flows...',
];

export function AIInsightsPanel() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const currentMessage = useMemo(() => messages[index % messages.length], [index]);

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const typing = setInterval(() => {
      if (i < currentMessage.length) {
        setDisplayText((prev) => prev + currentMessage[i]);
        i += 1;
      } else {
        clearInterval(typing);
        const hold = setTimeout(() => setIndex((prev) => prev + 1), 1200);
        return () => clearTimeout(hold);
      }
    }, 40);

    return () => clearInterval(typing);
  }, [currentMessage]);

  return (
    <motion.div
      className="absolute right-8 top-8 w-[320px] rounded-3xl border border-cyan-100/30 bg-white/10 p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(72,255,200,0.22)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="text-xs text-gray-300 tracking-wide uppercase mb-2">AI Operations</div>
      <div className="min-h-[48px] text-sm text-white font-medium">{displayText}<span className="inline-block animate-pulse">|</span></div>
      <div className="mt-3 text-[11px] text-cyan-200/90">Real-time model updates every 0.8s. Your portfolio lines are being prepared for instant dashboard feed.</div>
    </motion.div>
  );
};
