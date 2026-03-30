'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { Mail, Lock, ArrowRight, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

export const LoginSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Form fade in and scale
      gsap.from(formRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: 'back.out',
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // TODO: Integrate with actual auth
      console.log('Login attempt:', { email, password });
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen py-20 px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 50%, #0f1729 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Welcome text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                Start Trading Like a Pro
              </h2>
              <p className="text-xl text-slate-300">
                Join thousands of traders making smarter decisions with AI-powered insights
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                { icon: TrendingUp, text: 'Real-time market prediction' },
                { icon: BarChart3, text: 'Smart portfolio analytics' },
                { icon: MapPin, text: 'Global market access' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <item.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-slate-200">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              className="pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-black text-emerald-400">50K+</div>
                  <div className="text-sm text-slate-400">Active Traders</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-3xl font-black text-cyan-400">$2.5B</div>
                  <div className="text-sm text-slate-400">Trading Volume</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Login form + AI insights */}
          <div className="space-y-8">
            {/* Login Card */}
            <motion.div
              ref={formRef}
              className="relative group"
            >
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 via-cyan-500/30 to-emerald-500/50 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-700" />

              {/* Card */}
              <div className="relative p-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Welcome Back</h3>
                  <p className="text-sm text-slate-400 mt-1">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email input */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white/15 transition"
                      required
                    />
                  </div>

                  {/* Password input */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white/15 transition"
                      required
                    />
                  </div>

                  {/* Remember me + Forgot password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <a href="#" className="text-emerald-400 hover:text-emerald-300 transition">
                      Forgot password?
                    </a>
                  </div>

                  {/* Login button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Login to Dashboard
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
                  </div>
                </div>

                {/* Google login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </motion.button>

                {/* Sign up link */}
                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{' '}
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
                    Sign up now
                  </a>
                </p>
              </div>
            </motion.div>

            {/* AI Confidence + Sentiment badges */}
            <div className="grid grid-cols-2 gap-4">
              {/* AI Confidence Meter */}
              <motion.div
                className="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Confidence</div>
                <div className="space-y-2">
                  <motion.div
                    className="h-2 bg-white/10 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                      animate={{ width: ['78%', '80%', '78%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="text-lg font-black text-emerald-400">78% Bullish</div>
                </div>
              </motion.div>

              {/* Market Sentiment */}
              <motion.div
                className="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Market Sentiment</div>
                <motion.div
                  className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-500/50 rounded-lg"
                  animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 0 8px rgba(16,185,129,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="font-black text-sm text-emerald-300">BULLISH</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
