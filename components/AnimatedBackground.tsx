 'use client';
import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50" />
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.07),rgba(66,153,225,0.02),rgba(16,185,129,0.07))]"
        animate={{ x: ['-15%', '15%', '-15%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-10 left-8 h-36 w-80 rounded-2xl bg-white/50 backdrop-blur-sm"
          animate={{ y: [0, 18, 0], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-32 right-16 h-28 w-64 rounded-2xl bg-white/50 backdrop-blur-sm"
          animate={{ y: [0, -16, 0], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, idx) => (
          <motion.span
            key={idx}
            style={{
              width: `${2 + (idx % 4)}px`,
              height: `${2 + (idx % 4)}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            className="absolute rounded-full bg-emerald-400/20"
            animate={{ y: ['0px', '8px', '0px'], opacity: [0.03, 0.09, 0.03] }}
            transition={{ duration: 10 + idx, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: idx * 0.15 }}
          />
        ))}
      </motion.div>

      <motion.svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <motion.line x1="5%" y1="15%" x2="65%" y2="21%" stroke="rgba(16,185,129,0.12)" strokeWidth="1" />
        <motion.line x1="20%" y1="45%" x2="80%" y2="50%" stroke="rgba(56,189,248,0.1)" strokeWidth="1" />
        <motion.line x1="10%" y1="70%" x2="78%" y2="76%" stroke="rgba(16,185,129,0.11)" strokeWidth="1" />
      </motion.svg>
    </div>
  );
}
