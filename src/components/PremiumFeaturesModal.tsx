import React, { useState } from 'react';
import { X, Zap, TrendingUp, BarChart3, Lock, Star, ChevronRight, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';
import { SmartMoneyTracker } from './SmartMoneyTracker';
import { AIScenarioSimulator } from './AIScenarioSimulator';

interface PremiumFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
}

export const PremiumFeaturesModal: React.FC<PremiumFeaturesModalProps> = ({ isOpen, onClose, isPro }) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'smart-money',
      title: 'Smart Money Tracker',
      description: 'Track whale transactions, volume spikes & institutional flows in real-time',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-amber-400 to-orange-400',
      badge: 'Live',
      content: <SmartMoneyTracker />,
      locked: false
    },
    {
      id: 'scenario-simulator',
      title: 'AI Scenario Simulator',
      description: 'Generate bullish, bearish & sideways price scenarios with probability analysis',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'from-purple-400 to-pink-400',
      badge: 'Live',
      content: <AIScenarioSimulator />,
      locked: false
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Multi-timeframe analysis, pattern recognition & ML predictions',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-400 to-indigo-400',
      badge: 'Coming Soon',
      content: null,
      locked: true
    }
  ];

  const selectedFeatureData = features.find(f => f.id === selectedFeature);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl border-b border-white/40 px-8 py-8 flex items-center justify-between rounded-t-[3rem] z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Premium Features</h2>
                <p className="text-sm text-slate-500 mt-1">Unlock advanced trading intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/60 rounded-2xl transition-all active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {selectedFeatureData ? (
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                >
                  ← Back to Features
                </button>

                {/* Selected Feature Content */}
                <div>
                  <div className="flex items-start gap-4 mb-8">
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-white',
                        `bg-gradient-to-br ${selectedFeatureData.color}`
                      )}
                    >
                      {selectedFeatureData.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">{selectedFeatureData.title}</h3>
                        <span className="text-xs font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-full">
                          {selectedFeatureData.badge}
                        </span>
                      </div>
                      <p className="text-slate-600">{selectedFeatureData.description}</p>
                    </div>
                  </div>

                  {selectedFeatureData.locked ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-3xl">
                      <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium mb-4">Coming Soon</p>
                      <p className="text-sm text-slate-400">This premium feature is under development</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-200">
                      {selectedFeatureData.content}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => !feature.locked && setSelectedFeature(feature.id)}
                      disabled={feature.locked && !isPro}
                      className={cn(
                        'group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden',
                        'hover:shadow-lg active:scale-95',
                        feature.locked && !isPro
                          ? 'border-slate-200 bg-white/30 opacity-60 cursor-not-allowed'
                          : 'border-white/60 bg-white/60 hover:bg-white hover:border-primary/40'
                      )}
                    >
                      {/* Gradient background */}
                      <div
                        className={cn(
                          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
                          `bg-gradient-to-br ${feature.color}`
                        )}
                      />

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform',
                            `bg-gradient-to-br ${feature.color}`
                          )}
                        >
                          {feature.icon}
                        </div>

                        {/* Title & Badge */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-slate-900">{feature.title}</h3>
                          {feature.locked && !isPro && (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        {/* Badge */}
                        <span className="inline-block text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg mb-3">
                          {feature.badge}
                        </span>

                        {/* Description */}
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{feature.description}</p>

                        {/* Arrow */}
                        {!feature.locked && (
                          <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pro Information */}
                {!isPro && (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <Star className="w-6 h-6 text-primary fill-primary flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 mb-1">Upgrade to Pro</p>
                        <p className="text-sm text-slate-600">
                          Unlock all premium features including Portfolio Optimizer and Advanced Analytics
                        </p>
                      </div>
                      <button className="btn-primary-glass !px-6 whitespace-nowrap ml-auto">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
