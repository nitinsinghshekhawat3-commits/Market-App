 'use client';
import { motion } from 'framer-motion';

export function NeuralLines() {
  const segments = [
    { x1: '12%', y1: '38%', x2: '45%', y2: '20%' },
    { x1: '25%', y1: '64%', x2: '62%', y2: '55%' },
    { x1: '10%', y1: '18%', x2: '60%', y2: '37%' },
  ];

  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      {segments.map((seg, i) => (
        <motion.line
          key={i}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke="rgba(16,185,129,0.14)"
          strokeWidth="0.9"
          initial={{ opacity: 0.02 }}
          animate={{ opacity: [0.02, 0.08, 0.02] }}
          transition={{ duration: 9 + i, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}
