'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const AIAnalyticsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate cards on scroll
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1,
            markers: false,
          },
          y: 100,
          opacity: 0,
          rotation: 5 + index * 2,
          duration: 1,
        });
      });

      // Parallax background
      gsap.to('.analytics-bg', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
          markers: false,
        },
        y: -50,
        opacity: 0.5,
      });
    });

    return () => ctx.revert();
  }, []);

  const assets = [
    { symbol: 'BTC-USD', name: 'Bitcoin', price: 42500, change: '+5.2%', color: 'from-orange-400 to-orange-600' },
    { symbol: '^NSEI', name: 'NIFTY 50', price: 22150, change: '+2.1%', color: 'from-emerald-400 to-emerald-600' },
    { symbol: '^GSPC', name: 'S&P 500', price: 5200, change: '+1.8%', color: 'from-blue-400 to-blue-600' },
  ];

  return (
    <section ref={sectionRef} className="relative w-full py-24 px-4 bg-white overflow-hidden">
      {/* Background element */}
      <div className="analytics-bg absolute inset-0 opacity-30">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-bl from-cyan-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Real-Time Market Analytics</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered analysis across global markets, from stocks to crypto, with institutional-grade insights
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="relative p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${asset.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{asset.symbol}</h3>
                      <p className="text-2xl font-black text-slate-900 mt-1">{asset.name}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${asset.color} flex items-center justify-center`}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Price and change */}
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-slate-900">${asset.price.toLocaleString()}</div>
                    <motion.div
                      className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100/80 rounded-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">{asset.change}</span>
                    </motion.div>
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="h-16 bg-gradient-to-r from-slate-50 to-transparent rounded-lg flex items-end justify-around p-2 gap-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-sm ${i % 2 === 0 ? 'bg-emerald-300' : 'bg-slate-200'}`}
                        animate={{ height: Math.random() * 40 + 10 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'mirror' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
