import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface ImageItem {
  id: number;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  icon: React.ReactNode;
}

interface ImageGalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGalleryPopup: React.FC<ImageGalleryPopupProps> = ({ isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const images: ImageItem[] = [
    {
      id: 1,
      title: "Real-Time Market Intelligence",
      description: "Access live market data, trends, and AI-powered insights across 50+ global exchanges with instant execution.",
      badge: "Live",
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 2,
      title: "AI-Powered Trading Signals",
      description: "Advanced neural networks analyze market patterns and generate predictive signals with 87% accuracy rate.",
      badge: "Pro",
      gradient: "from-purple-500 via-pink-500 to-red-500",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Portfolio Optimization",
      description: "Smart algorithms rebalance your portfolio in real-time based on market conditions and risk tolerance.",
      badge: "Premium",
      gradient: "from-amber-400 via-yellow-400 to-orange-500",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 4,
      title: "24/7 Smart Money Tracking",
      description: "Monitor whale transactions, institutional flows, and smart money movements across crypto and stocks.",
      badge: "Elite",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 5,
      title: "Advanced Risk Management",
      description: "Dynamic stop-loss, take-profit, and risk assessment tools protect your capital with precision.",
      badge: "Expert",
      gradient: "from-red-400 via-orange-500 to-yellow-500",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 6,
      title: "Global Sentiment Analysis",
      description: "Real-time sentiment tracking from news, social media, and market data across all major assets.",
      badge: "Analytics",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      icon: <Zap className="w-8 h-8" />
    }
  ];

  const currentImage = images[selectedIndex];
  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-amber-400/40 shadow-2xl overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              {/* Header */}
              <div className="relative h-16 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border-b border-amber-400/30 flex items-center justify-between px-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-white">Platform Features Showcase</h2>
                </motion.div>

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Side - Visual */}
                  <motion.div
                    className={`relative h-80 rounded-2xl bg-gradient-to-br ${currentImage.gradient} p-8 shadow-xl overflow-hidden`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-40 h-40 bg-white/10 rounded-full blur-3xl"
                          animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -50, 50, 0],
                          }}
                          transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${20 + i * 20}%`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Badge */}
                    <motion.div
                      className="absolute top-4 right-4 z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      <div className="px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold text-white border border-white/30">
                        {currentImage.badge}
                      </div>
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="relative z-10 text-white mb-8"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {currentImage.icon}
                    </motion.div>

                    {/* Text Overlay */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed">{currentImage.description}</p>
                    </div>
                  </motion.div>

                  {/* Right Side - Thumbnails & Navigation */}
                  <div className="space-y-6">
                    {/* Thumbnails */}
                    <div className="space-y-3">
                      <div className="text-sm text-amber-300/80 uppercase tracking-wider font-semibold">
                        More Features
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-600/50 scrollbar-track-slate-700/50">
                        {images.map((img, idx) => (
                          <motion.button
                            key={img.id}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              idx === selectedIndex
                                ? 'bg-amber-500/30 border border-amber-400/60 shadow-lg'
                                : 'bg-slate-700/40 border border-slate-600/40 hover:bg-slate-700/60'
                            }`}
                            onClick={() => setSelectedIndex(idx)}
                            whileHover={{ x: 5 }}
                          >
                            <div className="font-semibold text-white text-sm">{img.title}</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">{img.description}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-3 justify-between pt-4 border-t border-slate-600/40">
                      <button
                        onClick={prevImage}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-amber-500/30 text-white transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex gap-2">
                        {images.map((_, idx) => (
                          <motion.button
                            key={idx}
                            className={`h-2 rounded-full transition-all ${
                              idx === selectedIndex
                                ? 'w-8 bg-amber-400'
                                : 'w-2 bg-slate-600'
                            }`}
                            onClick={() => setSelectedIndex(idx)}
                            whileHover={{ scale: 1.2 }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={nextImage}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-amber-500/30 text-white transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-t border-amber-400/30 px-8 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Feature {selectedIndex + 1} of {images.length}
                </div>
                <motion.button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg active:scale-95 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
