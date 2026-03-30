'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Zap, TrendingUp, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      featureRefs.current.forEach((feature, index) => {
        gsap.from(feature, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1,
            markers: false,
          },
          x: index % 2 === 0 ? -100 : 100,
          opacity: 0,
          duration: 1,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Market Prediction',
      description: 'Advanced ML algorithms analyze market patterns and predict price movements with high accuracy.',
    },
    {
      icon: Zap,
      title: 'Smart Money Tracking',
      description: 'Detect whale transactions and institutional flows in real-time across all major markets.',
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Insights',
      description: 'Get AI-powered suggestions for portfolio optimization based on your risk profile.',
    },
    {
      icon: BarChart3,
      title: 'Global Market Tracking',
      description: 'Monitor stocks, crypto, forex, and commodities with synchronized global data.',
    },
  ];

  return (
    <section ref={sectionRef} className="relative w-full py-24 px-4 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-cyan-200 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-emerald-200 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Institutional-Grade Features</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to make smarter investment decisions with AI-powered analytics
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                ref={(el) => {
                  featureRefs.current[index] = el;
                }}
                className="group"
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                <div className="flex gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    <motion.div
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Icon className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                    {/* CTA Link */}
                    <motion.div className="inline-flex items-center gap-2 pt-2 text-emerald-600 font-semibold text-sm cursor-pointer group/link">
                      Learn more
                      <motion.svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
