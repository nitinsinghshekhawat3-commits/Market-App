'use client';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { NeuralLines } from '../../components/NeuralLines';
import { FloatingCharts } from '../../components/FloatingCharts';
import { AIStatusPanel } from '../../components/AIStatusPanel';
import { LoginCard } from '../../components/LoginCard';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-cyan-50">
      <AnimatedBackground />
      <NeuralLines />
      <FloatingCharts />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 rounded-2xl border border-gray-200/40 bg-white/75 p-7 shadow-sm backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-slate-800">AI Financial Overview</h1>
            <p className="text-slate-600">AI-driven models estimating market opportunities with clean, secure workflow. Still calm, just more confident.</p>

            <div className="space-y-2">
              <p className="text-sm text-emerald-700">● AI Predicting Markets...</p>
              <p className="text-sm text-blue-700">● Analyzing Global Trends...</p>
              <p className="text-sm text-teal-700">● Generating Signals...</p>
            </div>

            <AIStatusPanel />
          </div>

          <div className="flex items-center justify-center">
            <LoginCard />
          </div>
        </div>
      </div>
    </div>
  );
}
