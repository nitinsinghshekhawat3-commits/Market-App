'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export const LoginCard: React.FC = () => {
  const router = useRouter();
  const { upgradeToPro } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (isLogin) {
        upgradeToPro(formData.email.split('@')[0], formData.email);
      } else {
        upgradeToPro(formData.name, formData.email);
      }

      setLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Simulate Google login
    upgradeToPro('User', 'user@gmail.com');
    router.push('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Glowing background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/0 rounded-3xl blur-3xl" />

      {/* Glass card */}
      <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/50 shadow-2xl shadow-primary/10">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-xs font-black"
            >
              AI
            </motion.div>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            {isLogin ? 'Sign in to your Aura Intel account' : 'Join thousands of smart traders'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Name field (for signup) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              {isLogin && (
                <a href="#" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">
                  Forgot?
                </a>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 bg-white/50 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary to-emerald-400 text-white rounded-xl font-bold text-center shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white/60 text-slate-500 font-medium">or continue with</span>
          </div>
        </div>

        {/* Google button */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-white/50 border border-white/50 rounded-xl font-bold text-slate-900 hover:bg-white/70 transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5" />
          Google
        </motion.button>

        {/* Toggle login/signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 font-medium">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* AI Widgets */}
        <div className="mt-8 pt-8 border-t border-white/20 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-xl">
            <p className="text-xs font-bold text-slate-700">AI Confidence</p>
            <motion.span
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-sm font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent"
            >
              94%
            </motion.span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl">
            <p className="text-xs font-bold text-slate-700">Market Sentiment</p>
            <span className="text-sm font-black text-emerald-600">BULLISH</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
