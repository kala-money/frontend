import HeroSection from "@/components/landing/HeroSection";
import LifecycleSection from "@/components/landing/LifecycleSection";
import MechanismVisualizer from "@/components/landing/MechanismVisualizer";
import StabilityMetrics from "@/components/landing/StabilityMetrics";
import YieldBufferSection from "@/components/landing/YieldBufferSection";
import ArchitectureOverview from "@/components/landing/ArchitectureOverview";
import EconomicTicker from "@/components/common/EconomicTicker";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col text-white overflow-x-hidden">
      <div className="fixed top-20 left-0 w-full z-40">
        <EconomicTicker />
      </div>

      <div className="mt-12">
        <HeroSection />
      </div>

      <LifecycleSection />

      <section className="py-16 bg-white/2 border-y border-white/5">
        <div className="container mx-auto px-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 mb-12 text-center">Protocol Vitals</h3>
          <StabilityMetrics />
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        {/* Background glow for the computation section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <MechanismVisualizer />
      </section>

      <YieldBufferSection />

      <ArchitectureOverview />

      {/* Final subtle call to action */}
      <section className="py-24 border-t border-white/5 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm text-zinc-500 font-light mb-8 max-w-lg mx-auto">
            KALA is an open protocol. All mechanics and state parameters are verifiable on-chain.
          </p>
          <div className="flex justify-center gap-8">
            <a href="/stake" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors border-b border-white/10 pb-1">Enter Protocol</a>
            <a href="/docs" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors border-b border-white/10 pb-1">Documentation</a>
          </div>
        </div>
      </section>
    </main>
  );
}
