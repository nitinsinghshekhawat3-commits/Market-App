'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, ExternalLink, Zap, TrendingUp, Globe } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
}

export const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/markets');
        const data = await response.json();
        
        // Mock news data since we don't have a news endpoint
        setNews([
          {
            id: '1',
            title: 'AI Stocks Surge as Tech Giants Report Record Earnings',
            description: 'Major technology companies post stronger-than-expected quarterly results, driving market rally in AI-related stocks.',
            source: 'Market News',
            url: '#',
            timestamp: new Date().toISOString(),
            sentiment: 'positive',
            category: 'Tech'
          },
          {
            id: '2',
            title: 'Bitcoin Reaches New All-Time High',
            description: 'Cryptocurrency market celebrates as Bitcoin breaks through $100,000 barrier.',
            source: 'Crypto Daily',
            url: '#',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            sentiment: 'positive',
            category: 'Crypto'
          },
          {
            id: '3',
            title: 'Fed Signals Potential Rate Cut',
            description: 'Federal Reserve officials hint at possible interest rate reduction in coming months.',
            source: 'Financial Times',
            url: '#',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            sentiment: 'positive',
            category: 'Markets'
          },
          {
            id: '4',
            title: 'Global Markets Show Mixed Signals',
            description: 'Stock indices across different regions display divergent performance patterns.',
            source: 'Reuters',
            url: '#',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            sentiment: 'neutral',
            category: 'Markets'
          },
          {
            id: '5',
            title: 'Energy Sector Under Pressure',
            description: 'Oil prices decline amid concerns about global demand slowdown.',
            source: 'Energy Markets',
            url: '#',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            sentiment: 'negative',
            category: 'Energy'
          }
        ]);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const categories = ['all', 'Tech', 'Crypto', 'Markets', 'Energy'];
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600 bg-emerald-50';
      case 'negative': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-black text-slate-900">Market News</h1>
        <p className="text-slate-600 font-medium">Stay updated on latest market trends and news</p>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/50 text-slate-600 hover:bg-white/70'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* News List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group hover:text-primary transition-colors"
                  >
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h3>
                  </a>
                  <p className="text-slate-600 font-medium line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span>{item.source}</span>
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default News;
