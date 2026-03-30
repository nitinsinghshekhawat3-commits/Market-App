import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const layerMotion = {
  animate: {
    x: ['0%', '35%', '0%'],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const neuralPaths = [
  { x1: 20, y1: 50, x2: 85, y2: 20, delay: 0 },
  { x1: 15, y1: 80, x2: 80, y2: 65, delay: 0.2 },
  { x1: 10, y1: 30, x2: 75, y2: 10, delay: 0.4 },
  { x1: 35, y1: 15, x2: 90, y2: 50, delay: 0.6 },
];

export const AnimatedBackground = () => {
  useEffect(() => {
    document.body.style.background = '#0b1120';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-70 bg-gradient-to-r from-cyan-600 via-slate-900 to-purple-700" />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
      />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(112,255,196,0.25),transparent_20%),radial-gradient(circle_at_80%_50%,rgba(145,124,255,0.22),transparent_0)]"
        {...layerMotion}
      />

      <motion.div
        className="absolute w-[180%] h-[180%] top-[-40%] left-[-40%] blur-[20px]"
        animate={{ rotate: [0, 2, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(145,255,245,0.15),transparent_35%)]" />
      </motion.div>

      <AnimatePresence>
        {[...Array(5)].map((_, idx) => (
          <motion.div
            key={`candle-${idx}`}
            className="absolute rounded-xl border border-cyan-300/20 bg-cyan-300/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,156,0.35)]"
            initial={{ opacity: 0, x: -120, y: 50 + idx * 70, scale: 0.6 }}
            animate={{ opacity: 0.35, x: 120 + (idx * 20), y: 40 + idx * 70, scale: 1.12 }}
            transition={{ duration: 8 + idx * 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        ))}
      </AnimatePresence>

      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {neuralPaths.map((p, i) => (
          <motion.line
            key={i}
            x1={`${p.x1}%`}
            y1={`${p.y1}%`}
            x2={`${p.x2}%`}
            y2={`${p.y2}%`}
            stroke="rgba(84, 240, 255, 0.45)"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1], opacity: [0.2, 1] }}
            transition={{ duration: 2.5, delay: p.delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, idx) => (
          <motion.span
            key={`particle-${idx}`}
            className="absolute block bg-cyan-300/50 rounded-full"
            style={{
              width: `${2 + (idx % 3)}px`,
              height: `${2 + (idx % 3)}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ y: ['0px', '-20px', '0px'], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3 + (idx % 3), repeat: Infinity, delay: idx * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
};
