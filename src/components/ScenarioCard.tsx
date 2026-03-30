import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, HelpCircle } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface ScenarioCardProps {
  scenario: 'bullish' | 'bearish' | 'sideways';
  priceTarget: number;
  probability: number;
  reasoning: string;
  volatility: number;
  currency: string;
  fxRate: number;
  isExpanded: boolean;
  onToggle: () => void;
  currentPrice: number;
  isINR?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  priceTarget,
  probability,
  reasoning,
  volatility,
  currency,
  fxRate,
  isExpanded,
  onToggle,
  currentPrice,
  isINR = false
}) => {
  // Get Suggested Action
  const getSuggestedAction = (scenario: string): string => {
    switch (scenario) {
      case 'bullish':
        return 'Consider Buying';
      case 'bearish':
        return 'Avoid or Wait';
      case 'sideways':
        return 'Hold / No clear trend';
      default:
        return 'Monitor';
    }
  };

  // Get Confidence Level
  const getConfidenceLevel = (probability: number): { label: string; color: string } => {
    if (probability > 40) return { label: 'High', color: 'text-primary' };
    if (probability >= 25) return { label: 'Medium', color: 'text-amber-600' };
    return { label: 'Low', color: 'text-slate-500' };
  };

  // Get Risk Tag
  const getRiskTag = (vol: number): { label: string; color: string; bg: string } => {
    if (vol > 0.15) return { label: 'High Risk', color: 'text-white', bg: 'bg-red-500' };
    if (vol >= 0.08) return { label: 'Medium Risk', color: 'text-white', bg: 'bg-amber-500' };
    return { label: 'Low Risk', color: 'text-white', bg: 'bg-primary' };
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'bullish':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' };
      case 'bearish':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      case 'sideways':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-600' };
    }
  };

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5" />;
      case 'sideways':
        return <Minus className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const colors = getScenarioColor(scenario);
  const confidence = getConfidenceLevel(probability);
  const risk = getRiskTag(volatility);
  const priceChange = priceTarget - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  const action = getSuggestedAction(scenario);

  return (
    <div
      className={cn(
        'border-2 rounded-2xl p-5 transition-all cursor-pointer',
        colors.bg,
        colors.border,
        isExpanded && 'ring-2 ring-primary/50'
      )}
      onClick={onToggle}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className={cn('p-3 rounded-xl', colors.bg)}>
            <div className={colors.icon}>{getScenarioIcon(scenario)}</div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={cn('text-lg font-bold uppercase', colors.text)}>
                {scenario}
              </h4>
              {/* Risk Tag */}
              <span className={cn('text-xs font-black px-2.5 py-1 rounded-lg', risk.bg, risk.color)}>
                {risk.label}
              </span>
            </div>

            {/* Price Target */}
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs font-semibold">Target</p>
                <p className="font-bold text-slate-900">{formatCurrency(priceTarget, currency as 'USD' | 'INR', fxRate, isINR)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold">Change</p>
                <p className={cn('font-bold', priceChange >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Probability & Confidence */}
        <div className="text-right flex items-center gap-3">
          <div>
            <div className={cn('text-2xl font-black', colors.text)}>
              {probability}%
            </div>
            <div className={cn('text-xs font-bold', confidence.color)}>
              {confidence.label}
            </div>
          </div>

          {/* Info Icon with Tooltip */}
          <div className="relative group">
            <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-slate-600" />
            <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 w-48 bg-slate-900 text-white text-xs p-2 rounded-lg z-50 whitespace-normal">
              Probability shows likelihood of this scenario based on trend and volatility. It is not a guarantee.
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Action */}
      <div className="mt-3 pt-3 border-t border-white/50">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Suggested Action</p>
        <p className={cn('text-sm font-bold', colors.text)}>{action}</p>
      </div>

      {/* Expanded Reasoning */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/50">
          <p className="text-sm font-semibold text-slate-700 mb-2">Why?</p>
          <p className={cn('text-sm leading-relaxed', colors.text)}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
};
