import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Zap, BarChart2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const UpgradeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { upgradeToPro, updateUserProfile } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      upgradeToPro(name, email);
      if (updateUserProfile) {
        updateUserProfile(name, gender);
      }
      setStep(2);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <div className="p-8 md:p-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Unlock AI Intelligence</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Register now to access institutional-grade analysis, including pros/cons, future plans, and real-time market signals.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Gender</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl font-bold transition-all",
                      gender === 'male'
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl font-bold transition-all",
                      gender === 'female'
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Female
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-4"
              >
                Upgrade Now
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <Shield className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Secure</p>
              </div>
              <div className="text-center">
                <BarChart2 className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Insights</p>
              </div>
              <div className="text-center">
                <Zap className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Real-time</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Pro, {name}!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Your account has been upgraded. You now have full access to our AI-powered financial intelligence.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-text-rich text-white rounded-2xl font-bold hover:bg-opacity-90 transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
