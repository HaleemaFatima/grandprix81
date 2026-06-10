import Link from "next/link";
import Navbar from "./components/Navbar";

const STATS = [
  { value: "24", label: "Circuits" },
  { value: "5", label: "Compounds" },
  { value: "3", label: "Strategy Modes" },
  { value: "∞", label: "Simulations" },
];

const FEATURES = [
  {
    icon: "🏎",
    title: "24-Circuit Library",
    desc: "Every current Grand Prix venue with track-specific lap time multipliers and tyre wear characteristics.",
  },
  {
    icon: "🧠",
    title: "Rule-Based Engine",
    desc: "Cliff modelling, safety car windows, compound sequencing — the same logic used by real F1 strategy engineers.",
  },
  {
    icon: "📊",
    title: "Degradation Chart",
    desc: "Live Recharts visualisation of lap-by-lap tyre wear with pit stop markers and compound colour coding.",
  },
  {
    icon: "⚡",
    title: "3 Strategy Modes",
    desc: "Aggressive, Balanced, or Conservative — each changes tyre sequence, stint length, and pit window timing.",
  },
  {
    icon: "🌧",
    title: "Weather Scenarios",
    desc: "Dry, Mixed, or Wet conditions alter compound selection, base lap times, and estimated race time.",
  },
  {
    icon: "🚨",
    title: "Safety Car Risk",
    desc: "Model SC probability and see how an early yellow flag shifts your optimal pit lap by up to 16 seconds.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14 bg-black">
        <div className="absolute inset-0 bg-grid-pattern bg-grid pointer-events-none" />
        <div className="absolute inset-0 speed-lines pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] blur-[140px] rounded-full pointer-events-none bg-red-900/20" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-red-800 bg-red-950/50 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-f1red pulse-dot" />
            <span className="text-f1red text-[10px] font-black tracking-[0.2em] uppercase">
              F1 Strategy Simulator
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-none mb-3">
            Grand<span className="text-f1red">Prix</span>81
          </h1>

          <p className="text-neutral-500 text-base md:text-lg font-light tracking-widest uppercase mb-4">
            Think like a strategy engineer.
          </p>

          <p className="text-neutral-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-10">
            Pick your track, tyres, weather, and mode. The engine calculates
            your optimal pit window, tyre sequence, and projected race time lap
            by lap.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/simulator"
              className="bg-f1red hover:bg-red-600 text-white font-black text-xs tracking-[0.2em] uppercase px-8 py-4 transition-all glow-red hover:scale-105"
            >
              Launch Simulator
            </Link>

            <Link
              href="#features"
              className="border border-neutral-800 hover:border-neutral-600 text-neutral-500 hover:text-white font-semibold text-xs tracking-[0.2em] uppercase px-8 py-4 transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-20 grid grid-cols-2 sm:grid-cols-4 w-full max-w-3xl mx-auto border border-neutral-900 divide-x divide-neutral-900">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-neutral-950 py-6 text-center">
              <p className="text-4xl font-black text-white">{value}</p>
              <p className="text-neutral-500 text-[10px] tracking-[0.15em] uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-700 text-[10px] tracking-widest uppercase">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-neutral-700 to-transparent" />
        </div>
      </section>

      <section id="features" className="bg-black border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14 text-center">
            <p className="text-f1red text-[10px] tracking-[0.2em] uppercase font-black mb-3">
              Built for precision
            </p>

            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">
              Strategy intelligence, lap by lap.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-black p-8 hover:bg-neutral-950 transition-colors group"
              >
                <div className="text-2xl mb-4">{icon}</div>

                <div className="w-8 h-[2px] bg-f1red mb-3 group-hover:w-12 transition-all duration-300" />

                <h3 className="text-white font-bold text-sm mb-2">
                  {title}
                </h3>

                <p className="text-neutral-500 text-xs leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-f1red">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="text-white text-3xl font-black mb-4 tracking-tight">
            Ready to race?
          </h2>

          <p className="text-white/70 text-sm mb-8">
            Build your perfect strategy in under a minute.
          </p>

          <Link
            href="/simulator"
            className="inline-block bg-black hover:bg-neutral-900 text-white font-black text-xs tracking-[0.2em] uppercase px-10 py-4 transition-all hover:scale-105"
          >
            Open Simulator
          </Link>
        </div>
      </section>

      <footer className="bg-black border-t border-neutral-900 py-6 text-center text-neutral-700 text-xs tracking-wide">
        GrandPrix81 · F1 Strategy Simulator · Not affiliated with Formula 1 or
        FIA
      </footer>
    </>
  );
}