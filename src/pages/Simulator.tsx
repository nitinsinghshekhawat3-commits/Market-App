import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { simulateScenario } from '../services/aiService';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Zap, BrainCircuit, TrendingUp, TrendingDown, AlertCircle, Info, ArrowRight, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../lib/apiConfig';

export const Simulator = () => {
  const { currency, fxRate } = useApp();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [scenario, setScenario] = useState('');
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search && !selectedAsset) {
       fetch(getApiUrl(`api/search?q=${search}`))
          .then(res => res.json())
          .then(data => setResults(data))
          .catch(() => {});
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedAsset]);

  const handleSelectAsset = async (asset: any) => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`api/stocks/${asset.symbol}`));
      if (!res.ok) throw new Error('Failed to fetch asset data');
      
      const d = await res.json();
      
      // Ensure we have required data
      if (!d.quote || !d.quote.regularMarketPrice) {
        console.error('Invalid response data:', d);
        setLoading(false);
        return;
      }

      setSelectedAsset({
        ...asset,
        price: d.quote.regularMarketPrice || 0,
        currency: d.quote.currency || 'USD'
      });
      setSearch(asset.symbol);
      setResults([]);
    } catch (error) {
      console.error('Error selecting asset:', error);
      setSelectedAsset(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedAsset || !scenario) {
      console.warn('Missing required fields for simulation');
      return;
    }
    
    setLoading(true);
    try {
      // Convert price to selected currency for AI analysis
      const isSourceINR = selectedAsset.currency === 'INR';
      const convertedPrice = currency === 'INR' && !isSourceINR ? selectedAsset.price * fxRate :
                            currency === 'USD' && isSourceINR ? selectedAsset.price / fxRate :
                            selectedAsset.price;

      const result = await simulateScenario(selectedAsset.symbol, convertedPrice, scenario, currency);
      
      if (!result) {
        console.error('No result returned from simulator');
        setSimulation(null);
        // Show a message or use fallback
        return;
      }
      
      // Validate the result has required fields
      if (typeof result.estimatedValue !== 'number') {
        console.error('Invalid simulation result format:', result);
        setSimulation(null);
        return;
      }
      
      setSimulation(result);
    } catch (error) {
      console.error('Error in simulation:', error);
      setSimulation(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedAsset(null);
    setSearch('');
    setScenario('');
    setSimulation(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 rounded-2xl text-primary font-black text-[10px] uppercase tracking-widest shadow-sm">
          <BrainCircuit className="w-4 h-4" /> AI Powered
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">AI What-If Simulator</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
          Test hypothetical market scenarios and see how they might impact your favorite assets. 
          Powered by advanced generative intelligence.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card space-y-10">
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Select Asset</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search symbol (e.g. AAPL)"
                  className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-inner"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (selectedAsset) setSelectedAsset(null);
                  }}
                />
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-50 py-3 animate-in fade-in zoom-in-95 duration-300">
                    {results.map((res, index) => (
                      <button
                        key={`${res.symbol}-${index}`}
                        onClick={() => handleSelectAsset(res)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors text-left group"
                      >
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-primary transition-colors">{res.symbol}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-[150px] uppercase tracking-widest">{res.shortname}</p>
                        </div>
                        <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-xl text-slate-500 uppercase tracking-widest">
                          {res.quoteType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedAsset && (
                <div className="flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/10 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20">
                      {selectedAsset.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{selectedAsset.symbol}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatCurrency(selectedAsset.price, currency, fxRate, selectedAsset.currency === 'INR')}</p>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-400 hover:text-negative">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Define Scenario</label>
              <textarea
                placeholder="e.g. 'What if the price drops 15% due to a global supply chain issue?'"
                className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-3xl py-5 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none min-h-[160px] resize-none shadow-inner leading-relaxed"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                {['Price drops 10%', 'Interest rate hike', 'Bull market run', 'Invest $1000'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setScenario(s)}
                    className="text-[10px] font-black px-4 py-2 bg-white/50 text-slate-500 rounded-xl hover:bg-primary hover:text-white transition-all border border-white/50 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading || !selectedAsset || !scenario}
              className="btn-primary-glass w-full !py-5 !rounded-3xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
              Run AI Simulation
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!simulation && !loading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] glass-card !bg-white/30 border-dashed border-slate-300 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-sm mb-8 border border-white/50">
                  <BrainCircuit className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Ready to Simulate</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-bold">Select an asset and describe a scenario to see AI-powered projections.</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] glass-card flex flex-col items-center justify-center space-y-10"
              >
                <div className="relative">
                  <div className="w-32 h-32 border-8 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <BrainCircuit className="w-12 h-12 text-primary absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-slate-900">AI is Thinking...</h3>
                  <p className="text-slate-500 font-bold">Processing market variables and historical data...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card !p-0 overflow-hidden"
              >
                <div className="p-10 border-b border-white/40 bg-white/20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Simulation Results</h2>
                      <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Hypothetical outcome for {selectedAsset.symbol}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Future Value</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                          {simulation?.estimatedValue ? formatCurrency(simulation.estimatedValue, currency, fxRate, (selectedAsset?.currency || 'USD') === 'INR') : '-'}
                        </p>
                      </div>
                      <div className={cn(
                        "px-6 py-3 rounded-[1.5rem] flex items-center gap-3 shadow-sm",
                        simulation.riskImpact === 'Low' ? "bg-primary text-white shadow-primary/20" :
                        simulation.riskImpact === 'Medium' ? "bg-amber-400 text-white shadow-amber-400/20" :
                        "bg-negative text-white shadow-negative/20"
                      )}>
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest">{simulation.riskImpact} Risk</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-12">
                  <div className="h-[350px] w-full bg-white/30 rounded-[2.5rem] p-8 border border-white/40 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulation.projectionData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D084" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00D084" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                          label={{ value: 'Days', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [formatCurrency(value, currency, fxRate, (selectedAsset?.currency || 'USD') === 'INR'), 'Value']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00D084" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                        <Info className="w-6 h-6 text-primary" /> AI Explanation
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {simulation.explanation}
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/50 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Case</span>
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{simulation.bestCase}</p>
                      </div>
                      <div className="p-6 bg-white/50 rounded-[2rem] border border-white/50 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Worst Case</span>
                          <TrendingDown className="w-5 h-5 text-negative" />
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{simulation.worstCase}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const X = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    onClick={onClick}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
