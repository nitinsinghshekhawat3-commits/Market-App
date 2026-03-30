'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Globe } from 'lucide-react';
import { Link } from 'next/navigation';

export const LandingNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-rich">
            Aura <span className="text-primary">Intel</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-bold text-slate-600 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <motion.a
            href="#login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            Sign In
          </motion.a>
          <motion.a
            href="#login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Get Started
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/50 rounded-lg transition-all"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/20 bg-white/90 backdrop-blur-md"
        >
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-bold text-slate-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/20 space-y-3">
              <a
                href="#login"
                className="block w-full text-center px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-all"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </a>
              <a
                href="#login"
                className="block w-full text-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl transition-all"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
