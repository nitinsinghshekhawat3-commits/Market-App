import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function LoginCard() {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentiment, setSentiment] = useState<'Bullish' | 'Bearish'>('Bullish');
  const [confidence, setConfidence] = useState(72);

  const submitLogin = async (action: 'login' | 'signup' | 'google') => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Optional sound effect
    try {
      const tone = new Audio("https://freesound.org/data/previews/341/341695_4939433-lq.mp3");
      tone.volume = 0.3;
      tone.play().catch(() => null);
    } catch (err) {
      // quietly ignore if not supported
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockedToken = btoa(`${email}:${Date.now()}`);
    localStorage.setItem('marketstock_user_token', mockedToken);
    localStorage.setItem('marketstock_user_email', email);

    setLoading(false);

    if (action === 'google') {
      setSentiment('Bullish');
      setConfidence((prev) => Math.max(60, Math.min(95, prev + 8)));
    } else {
      setSentiment(Math.random() > 0.45 ? 'Bullish' : 'Bearish');
      setConfidence(Math.max(40, Math.min(95, Math.round(Math.random() * 35 + 60))));
    }

    navigate('/dashboard');
  };

  const updateProgress = loading ? 1 : 0;

  return (
    <motion.div
      className="relative w-full max-w-md rounded-3xl border border-cyan-200/30 bg-white/8 p-8 backdrop-blur-2xl shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">Welcome back</div>
          <div className="text-sm text-cyan-100/90">Secure access to your AI finance cockpit</div>
        </div>
        <div className="rounded-full bg-gradient-to-br from-emerald-400 to-cyan-300 px-3 py-1 text-xs font-semibold text-slate-900">Pro Smart</div>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-cyan-100">Email</label>
        <input
          className="w-full rounded-xl border border-cyan-400/60 bg-white/10 px-4 py-2 text-white outline-none placeholder:text-cyan-50/60 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/40"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-cyan-100">Password</label>
        <input
          className="w-full rounded-xl border border-cyan-400/60 bg-white/10 px-4 py-2 text-white outline-none placeholder:text-cyan-50/60 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/40"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="mb-4 text-sm text-rose-300">{error}</div>}

      <div className="space-y-3">
        <button
          onClick={() => submitLogin('login')}
          className="w-full rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-white font-semibold shadow-lg hover:shadow-[0_20px_50px_rgba(32,220,255,0.45)] active:scale-95 transition"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <button
          onClick={() => submitLogin('signup')}
          className="w-full rounded-xl border border-cyan-300/70 bg-white/12 px-4 py-2 text-cyan-100 font-semibold hover:bg-white/20 active:scale-95 transition"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Create account'}
        </button>
        <div className="w-full rounded-xl border border-cyan-300/70 bg-white/95 px-4 py-2 text-slate-900 font-semibold flex items-center justify-center">
          <div id="google-signin-button" className="w-full"></div>
        </div>
      </div>

      <div className="mt-8 text-sm text-white/70 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-cyan-200/90 uppercase tracking-wider">Market Sentiment</div>
          <div className={`font-semibold ${sentiment === 'Bullish' ? 'text-emerald-300' : 'text-rose-300'}`}>{sentiment}</div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-cyan-200/90 uppercase tracking-wider">AI Confidence</div>
          <div className="mt-1 h-2 w-full rounded-full bg-slate-500/30">
            <motion.div
              className="h-full rounded-full bg-emerald-300"
              style={{ width: `${confidence}%` }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="text-xs text-cyan-100/80 mt-1">{confidence}%</div>
        </div>
      </div>

      <motion.div
        className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-teal-400 via-cyan-300 to-purple-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: updateProgress }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
}
