import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, TrendingUp, Shield, Zap, Globe, BarChart3, Brain, Target, Award, Star, ChevronDown, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScrollImageCard from '../components/ScrollImageCard.tsx';
import { signInWithGoogle, signInWithApple, verifyOAuthToken } from '../services/oauthService';

interface LoginFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-Powered Insights",
    description: "Advanced neural networks analyze market patterns in real-time, providing predictive analytics that outperform traditional indicators.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Precision Trading",
    description: "Execute trades with microsecond precision using our proprietary algorithms and direct market access technology.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Bank-Grade Security",
    description: "Military-grade encryption, biometric authentication, and multi-factor security protocols protect your investments.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Markets",
    description: "Access 50+ global exchanges with real-time data feeds and instant execution across all major asset classes.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Advanced Analytics",
    description: "Interactive charts, technical indicators, and fundamental analysis tools powered by machine learning algorithms.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Elite Performance",
    description: "Join thousands of professional traders who have achieved consistent returns using our platform's edge.",
    color: "from-yellow-500 to-orange-500"
  }
];

const testimonials = [
  {
    name: "Aarti Sharma",
    role: "Professional Trader",
    avatar: "AS",
    content: "This platform transformed my trading career. The AI insights are incredibly accurate.",
    rating: 5,
    returns: "+127%"
  },
  {
    name: "Rohan Patel",
    role: "Portfolio Manager",
    avatar: "RP",
    content: "The security features and real-time analytics give me complete confidence in my decisions.",
    rating: 5,
    returns: "+89%"
  },
  {
    name: "Dr. Priya Verma",
    role: "Investment Analyst",
    avatar: "PV",
    content: "The neural network predictions have consistently outperformed all other indicators I've used.",
    rating: 5,
    returns: "+156%"
  }
];

export function AdvancedLogin() {
  const navigate = useNavigate();
  const { upgradeToPro } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store authentication data
      localStorage.setItem('marketstock_user_token', data.token);
      localStorage.setItem('marketstock_user_data', JSON.stringify(data.user));

      setSuccess(`${isLogin ? 'Login' : 'Account creation'} successful! Redirecting to dashboard...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!googleClientId || googleClientId.includes('YOUR_') || googleClientId.includes('_HERE')) {
      setError('Please configure VITE_GOOGLE_CLIENT_ID in .env before using Google login.');
      setLoading(false);
      return;
    }

    try {
      console.log('[Login] Starting Google sign-in...');
      
      // Trigger real Google Sign-In
      const result = await signInWithGoogle();

      if ('error' in result) {
        console.error('[Login] Google error:', result.error, result.details);
        throw new Error(result.error || 'Google login failed');
      }

      // Validate user data structure
      if (!result.user || !result.user.email || !result.user.name) {
        console.error('[Login] ❌ Invalid user data from Google:', result.user);
        throw new Error('Invalid user data from Google - email or name missing');
      }

      console.log('[Login] ✅ Google user data received:', {
        email: result.user.email,
        name: result.user.name,
        id: result.user.id
      });

      // Verify token with backend
      const response = await verifyOAuthToken(
        'google',
        result.token || '',
        result.user
      );

      if (!response.success) {
        throw new Error(response.error || 'Token verification failed');
      }

      // Validate backend response
      if (!response.user || !response.user.email || !response.user.name) {
        console.error('[Login] ❌ Invalid user data from backend:', response.user);
        throw new Error('Invalid user data from backend - email or name missing');
      }

      // Store authentication data (real Gmail ID and name)
      localStorage.setItem('marketstock_user_token', response.token);
      localStorage.setItem('marketstock_user_data', JSON.stringify(response.user));

      console.log('[Login] ✅ Google login successful - User:', {
        email: response.user.email,
        name: response.user.name,
        id: response.user.id
      });

      // Show appropriate message based on sign-in vs sign-up
      const welcomeMessage = response.message || `Welcome ${response.user.name}! Redirecting to dashboard...`;
      setSuccess(welcomeMessage);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      console.error('[Login] ❌ Google login error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');

    const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || '';
    if (!appleClientId || appleClientId.includes('YOUR_') || appleClientId.includes('_HERE')) {
      setError('Please configure Apple OAuth values in .env before using Apple login.');
      setLoading(false);
      return;
    }

    try {
      console.log('[Login] Starting Apple sign-in...');
      
      // Trigger real Apple Sign-In
      const result = await signInWithApple();

      if ('error' in result) {
        console.error('[Login] Apple error:', result.error, result.details);
        throw new Error(result.error || 'Apple login failed');
      }

      // Validate user data structure
      if (!result.user || !result.user.email || !result.user.name) {
        console.error('[Login] ❌ Invalid user data from Apple:', result.user);
        throw new Error('Invalid user data from Apple - email or name missing');
      }

      console.log('[Login] ✅ Apple user data received:', {
        email: result.user.email,
        name: result.user.name,
        id: result.user.id
      });

      // Verify token with backend
      const response = await verifyOAuthToken(
        'apple',
        result.token || '',
        result.user
      );

      if (!response.success) {
        throw new Error(response.error || 'Token verification failed');
      }

      // Validate backend response
      if (!response.user || !response.user.email || !response.user.name) {
        console.error('[Login] ❌ Invalid user data from backend:', response.user);
        throw new Error('Invalid user data from backend - email or name missing');
      }

      // Store authentication data (real Apple ID and name)
      localStorage.setItem('marketstock_user_token', response.token);
      localStorage.setItem('marketstock_user_data', JSON.stringify(response.user));

      console.log('[Login] ✅ Apple login successful - User:', {
        email: response.user.email,
        name: response.user.name,
        id: response.user.id
      });

      // Show appropriate message based on sign-in vs sign-up
      const welcomeMessage = response.message || `Welcome ${response.user.name}! Redirecting to dashboard...`;
      setSuccess(welcomeMessage);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Apple login failed. Please try again.';
      console.error('[Login] ❌ Apple login error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{ y: backgroundY, opacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </motion.div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MarketStock AI</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login / Signup
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}AI Trading
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Harness the power of advanced neural networks, real-time market analysis,
              and institutional-grade execution to maximize your investment returns.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.button
                onClick={() => scrollToSection('login')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Trading Now <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Features
              </motion.button>
            </motion.div>

            <motion.div
              className="flex justify-center items-center gap-8 mt-16 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancel Anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Revolutionary Trading Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of trading platforms with AI-powered insights,
              real-time analytics, and institutional-grade security.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-24 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Professional Traders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful traders who have transformed their investment strategies
              with our AI-powered platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">{testimonial.returns}</div>
                    <div className="text-gray-400 text-xs">Annual Return</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Hero Feature Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-black/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />
          <div className="absolute -top-10 left-[10%] w-[700px] h-[700px] rounded-full bg-green-500/15 filter blur-3xl" />
          <div className="absolute -top-16 right-[8%] w-[500px] h-[500px] rounded-full bg-blue-500/10 filter blur-3xl" />
          <div className="absolute bottom-[-200px] left-[35%] w-[950px] h-[950px] rounded-full bg-amber-500/5 filter blur-[130px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Trade in real world assets like Crude Oil, Gold, Silver and more
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-xl mt-4">
                One super-powered dashboard with real-time charting, AI signal engine, and smart risk control built for beginners and pros.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <motion.button
                  onClick={() => scrollToSection('login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-900 font-semibold rounded-xl shadow-lg"
                >
                  Explore Commodities
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-3 border border-white/25 text-white rounded-xl bg-white/5"
                >
                  Smart Money Tracker
                </motion.button>
              </div>
            </motion.div>

            <div className="relative h-[520px] md:h-[550px]">
              <motion.div
                className="absolute inset-0 rounded-3xl border border-white/20 overflow-hidden shadow-[0_25px_80px_rgba(15,23,42,0.55)] z-10"
                initial={{ opacity: 0.95, y: 0, scale: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <img
                  src="/market-chart.svg"
                  alt="Wide market chart" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/market-chart.svg';
                  }}
                />
              </motion.div>

              <motion.div
                className="absolute top-[44%] left-1/2 -translate-x-1/2 w-[340px] h-[580px] md:w-[360px] md:h-[620px] rounded-[38px] border border-white/20 bg-slate-950/0 overflow-hidden shadow-2xl z-20"
                initial={{ opacity: 0.93, y: 0, scale: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              >
                <img
                  src="/mobile-trading.svg"
                  alt="Trading phone UI"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/mobile-trading.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-[38px]" />
              </motion.div>

              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 rounded-3xl border border-cyan-400/15 shadow-[0_0_60px_rgba(34,211,238,0.4)]" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="relative py-24 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join MarketStock AI'}
              </h2>
              <p className="text-gray-300">
                {isLogin
                  ? 'Sign in to access your AI trading dashboard'
                  : 'Create your account and start trading with AI'
                }
              </p>
            </motion.div>

            {/* Social Login Buttons */}
            <motion.div
              className="space-y-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold border border-gray-200 disabled:opacity-60"
                style={{ backgroundColor: 'white', color: 'black' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.0 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-base font-semibold">{loading ? 'Connecting...' : 'Continue with Google'}</span>
              </motion.button>

            </motion.div>

            {/* Divider */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-gray-400 text-sm">or continue with email</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </motion.div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="Confirm your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
                    >
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300"
                    >
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Toggle Login/Signup */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                disabled={loading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"
                }
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MarketStock AI</span>
            </div>
            <p className="text-gray-400 mb-6">
              The future of AI-powered trading is here. Join thousands of successful traders.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}