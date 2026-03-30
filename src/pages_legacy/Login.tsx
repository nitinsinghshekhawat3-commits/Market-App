import { AnimatedBackground } from '../components/AnimatedBackground';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { LoginCard } from '../components/LoginCard';

export function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070f1d] text-white">
      <AnimatedBackground />
      <AIInsightsPanel />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 md:px-10">
        <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="flex h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[inset_0_0_40px_rgba(60,220,255,0.21)]">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-widest text-cyan-200">AI Finance Matrix</p>
              <h1 className="text-3xl font-black text-white sm:text-5xl">Live Strategy Lab</h1>
              <p className="text-cyan-100/90">Floating graph frames, neural map warp and algorithmic insight layers synthesize your portfolio view in real time.</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-cyan-100/70">
                <span className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 py-2">Teal algo core</span>
                <span className="rounded-xl border border-purple-300/40 bg-purple-300/10 py-2">Neural net mesh</span>
                <span className="rounded-xl border border-lime-300/40 bg-lime-300/10 py-2">Signal flux feed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <LoginCard />
          </div>
        </div>
      </div>
    </div>
  );
}
