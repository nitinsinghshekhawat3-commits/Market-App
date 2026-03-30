'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confidence] = useState(94);
  const router = useRouter();

  const login = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    const tone = new Audio('https://freesound.org/data/previews/353/353782_4019025-lq.mp3');
    tone.volume = 0.2;
    tone.play().catch(() => null);

    await new Promise((r) => setTimeout(r, 900));

    localStorage.setItem('finance_app_user', email);
    localStorage.setItem('finance_app_logged_in', 'true');
    setLoading(false);

    router.push('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-gray-200/30 bg-white/60 p-7 backdrop-blur-md shadow-xl"
    >
      <h2 className="text-lg font-bold text-slate-800 mb-1">Welcome Back</h2>
      <p className="text-sm text-slate-500 mb-6">Secure login to your AI finance dashboard</p>

      <label className="block mb-3">
        <span className="text-xs text-slate-500">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          placeholder="you@finance.com"
        />
      </label>

      <label className="block mb-3">
        <span className="text-xs text-slate-500">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          placeholder="••••••••"
        />
      </label>

      {error && <p className="text-sm text-rose-500 mb-3">{error}</p>}

      <button
        onClick={login}
        disabled={loading}
        className="mb-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-300 px-4 py-2 font-semibold text-white transition hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? 'Signing in…' : 'Login'}
      </button>

      <button
        onClick={() => {}}
        className="mb-3 w-full rounded-xl border border-emerald-300 bg-white px-4 py-2 text-emerald-700 transition hover:shadow-sm"
      >
        Sign Up
      </button>

      <button
        onClick={() => {}}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-slate-700 transition hover:shadow-sm flex items-center justify-center gap-2"
      >
        <span className="text-lg"></span> Continue with Google
      </button>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white/70 p-3">
        <p className="text-xs text-slate-500">AI Confidence: High</p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">BULLISH</span>
        <span className="text-xs text-slate-500">Live mini ticker: BTC ↑ +0.9% • NIFTY ↓ -1.0% • NASDAQ ↑</span>
      </div>
    </motion.div>
  );
}
