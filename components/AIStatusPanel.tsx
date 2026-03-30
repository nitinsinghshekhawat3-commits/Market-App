'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const statusMessages = ['AI Predicting Markets...', 'Analyzing Global Trends...', 'Generating Signals...'];

export function AIStatusPanel() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const current = useMemo(() => statusMessages[index % statusMessages.length], [index]);

  useEffect(() => {
    let pos = 0;
    setText('');
    const type = setInterval(() => {
      if (pos < current.length) {
        setText((prev) => prev + current[pos]);
        pos += 1;
      } else {
        clearInterval(type);
        const wait = setTimeout(() => setIndex((prev) => prev + 1), 1400);
        return () => clearTimeout(wait);
      }
    }, 40);

    return () => clearInterval(type);
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="rounded-2xl border border-emerald-100/40 bg-white/70 p-4 text-sm text-emerald-900 backdrop-blur-md shadow-sm"
    >
      <p className="font-semibold">{text}<span className="animate-pulse">|</span></p>
      <p className="text-[11px] text-slate-500">Live AI update feed. Updated every 1.4s.</p>
    </motion.div>
  );
}
