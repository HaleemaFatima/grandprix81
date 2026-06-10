"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LapTimeChart from "../components/LapTimeChart";
import ResultCard from "../components/ResultCard";
import AIAnalysisCard, { type StrategyAnalysis } from "../components/AIAnalysisCard";
import TyreBadge from "../components/TyreBadge";
import TrackSelect from "../components/TrackSelect";
import { formatTime, runStrategy, SimInput, StrategyResult, Tyre, Weather, StrategyType } from "@/lib/strategyEngine";
import { Play, RotateCcw } from "lucide-react";

const TYRES: Tyre[] = ["Soft","Medium","Hard","Intermediate","Wet"];
const DAILY_AI_ANALYSIS_LIMIT = 3;
const AI_ANALYSIS_STORAGE_KEY = "raceiq_ai_analysis_usage";

const TYRE_HINT: Record<Tyre, string> = {
  Soft:         "Fastest, degrades quickly",
  Medium:       "Balanced performance",
  Hard:         "Durable, slower warm-up",
  Intermediate: "Damp or drying track",
  Wet:          "Heavy rain conditions",
};

const STRATEGY_DESC: Record<StrategyType, string> = {
  Aggressive:   "Push tyres hard, more stops, chase fast laps",
  Balanced:     "Optimal window strategy, moderate risk",
  Conservative: "Protect tyres, fewer stops, manage pace",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#666] text-[10px] tracking-[0.15em] uppercase font-bold mb-2.5">
      {children}
    </p>
  );
}

function Pill({ label, selected, onClick, hint }: {
  label: string; selected: boolean; onClick: () => void; hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded text-xs font-semibold tracking-wide border transition-all text-left
        ${selected
          ? "bg-f1red border-f1red text-white glow-red"
          : "bg-black border-[#1E1E1E] text-[#999] hover:border-[#444] hover:text-white"}`}
    >
      {label}
      {hint && <span className="block text-[10px] font-normal mt-0.5 opacity-60">{hint}</span>}
    </button>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[#1A1A1A]" />
      <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase">{label}</span>
      <div className="h-px flex-1 bg-[#1A1A1A]" />
    </div>
  );
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStoredAiUsage(today = getLocalDateKey()) {
  if (typeof window === "undefined") {
    return { date: today, used: 0 };
  }

  try {
    const raw = window.localStorage.getItem(AI_ANALYSIS_STORAGE_KEY);
    if (!raw) {
      const initialValue = { date: today, used: 0 };
      window.localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(initialValue));
      return initialValue;
    }

    const parsed = JSON.parse(raw) as { date?: string; used?: number };
    if (parsed.date !== today) {
      const resetValue = { date: today, used: 0 };
      window.localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(resetValue));
      return resetValue;
    }

    return {
      date: today,
      used: typeof parsed.used === "number" ? parsed.used : 0,
    };
  } catch {
    const resetValue = { date: today, used: 0 };
    window.localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(resetValue));
    return resetValue;
  }
}

function buildLocalFallbackAnalysis({
  track,
  laps,
  startTyre,
  weather,
  safetyCar,
  strategy,
  result,
}: {
  track: string;
  laps: number;
  startTyre: Tyre;
  weather: Weather;
  safetyCar: "Low" | "Medium" | "High";
  strategy: StrategyType;
  result: StrategyResult;
}): StrategyAnalysis {
  const pitWindow = result.pitStops.length > 0
    ? result.pitStops.map(pit => `Lap ${pit.lap}`).join(", ")
    : "No scheduled pit stop";

  return {
    strategySummary: `The rule engine keeps a ${strategy.toLowerCase()} plan at ${track} over ${laps} laps. It projects a ${formatTime(result.estimatedRaceTime)} race with ${result.riskLevel.toLowerCase()} risk.`,
    tyreReasoning: `The sequence of ${result.tyreSequence.join(" → ")} fits the starting tyre of ${startTyre}, the ${weather.toLowerCase()} conditions, and the track demands. This is commentary only; the rule engine remains the source of truth.`,
    pitWindowLogic: `The pit window is centered on ${pitWindow}. That timing follows the rule-engine explanation: ${result.explanation}`,
    riskAnalysis: `Risk is ${result.riskLevel}, with safety car risk set to ${safetyCar}. The plan is balancing tyre life, track position, and pit-lane exposure without changing the underlying strategy.`,
    pitWallVerdict: "Pit wall verdict: keep the existing strategy result, use this explanation as a commentary layer, and only adapt if race conditions change.",
    source: "fallback",
  };
}

export default function SimulatorPage() {
  const [track, setTrack]         = useState("Spain");
  const [laps, setLaps]           = useState(50);
  const [startTyre, setStartTyre] = useState<Tyre>("Medium");
  const [weather, setWeather]     = useState<Weather>("Dry");
  const [safetyCar, setSafetyCar] = useState<"Low"|"Medium"|"High">("Medium");
  const [strategy, setStrategy]   = useState<StrategyType>("Balanced");
  const [result, setResult]       = useState<StrategyResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [analysis, setAnalysis]   = useState<StrategyAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState(() => getStoredAiUsage());

  useEffect(() => {
    const syncUsage = () => {
      const today = getLocalDateKey();
      const nextUsage = getStoredAiUsage(today);
      setAiUsage(prev => (
        prev.date === nextUsage.date && prev.used === nextUsage.used ? prev : nextUsage
      ));
    };

    const id = window.setInterval(syncUsage, 60_000);
    syncUsage();
    return () => window.clearInterval(id);
  }, []);

  function persistAiUsage(nextUsed: number) {
    const today = getLocalDateKey();
    const value = { date: today, used: nextUsed };
    window.localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(value));
    setAiUsage(value);
  }

  const dailyLimitReached = aiUsage.used >= DAILY_AI_ANALYSIS_LIMIT;
  const dailyLimitMessage = "Daily AI analysis limit reached. The simulator still works normally.";

  function handleRun() {
    setLoading(true);
    setResult(null);
    setAnalysis(null);
    setAnalysisError(null);
    setTimeout(() => {
      const input: SimInput = {
        track, totalLaps: laps, startingTyre: startTyre,
        weather, safetyCar, strategy,
      };
      setResult(runStrategy(input));
      setLoading(false);
    }, 400);
  }

  function handleReset() {
    setResult(null);
    setTrack("Spain");
    setLaps(50);
    setStartTyre("Medium");
    setWeather("Dry");
    setSafetyCar("Medium");
    setStrategy("Balanced");
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
  }

  async function handleGenerateAnalysis() {
    if (!result || dailyLimitReached) return;

    setAnalysisLoading(true);
    setAnalysisError(null);

    const pitWindow = result.pitStops.length > 0
      ? result.pitStops.map(pit => `Lap ${pit.lap}`).join(", ")
      : "No scheduled pit stop";

    try {
      const response = await fetch("/api/strategy-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          track,
          totalLaps: laps,
          startingTyre: startTyre,
          weather,
          safetyCarRisk: safetyCar,
          strategyMode: strategy,
          tyreSequence: result.tyreSequence,
          pitWindow,
          estimatedRaceTime: formatTime(result.estimatedRaceTime),
          riskLevel: result.riskLevel,
          explanation: result.explanation,
        }),
      });

      const data = await response.json();

      if (!response.ok && !data?.strategySummary) {
        throw new Error(data?.error || "Unable to generate AI strategist analysis.");
      }

      setAnalysis({
        strategySummary: data.strategySummary,
        tyreReasoning: data.tyreReasoning,
        pitWindowLogic: data.pitWindowLogic,
        riskAnalysis: data.riskAnalysis,
        pitWallVerdict: data.pitWallVerdict,
        source: data.source === "fallback" ? "fallback" : "gemini",
      });
      persistAiUsage(aiUsage.used + 1);
    } catch (error) {
      if (result) {
        setAnalysis(buildLocalFallbackAnalysis({
          track,
          laps,
          startTyre,
          weather,
          safetyCar,
          strategy,
          result,
        }));
        persistAiUsage(aiUsage.used + 1);
        setAnalysisError(null);
      } else {
        setAnalysisError(error instanceof Error ? error.message : "Unable to generate AI strategist analysis.");
      }
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen bg-black">

        {/* Page header */}
        <div className="border-b border-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
            <div className="w-1 h-10 bg-f1red rounded-full" />
            <div>
              <p className="text-f1red text-[10px] tracking-[0.2em] uppercase font-bold mb-0.5">Strategy Engine</p>
              <h1 className="text-white text-xl font-black tracking-tight">Race Simulator</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">

            {/* ── LEFT: Config panel ───────────────────────────────────── */}
            <div className="space-y-1">
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">Configuration</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-f1red pulse-dot" />
                    <span className="text-[#555] text-[10px] font-mono">LIVE</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* Circuit */}
                  <div>
                    <Label>Circuit</Label>
                    <TrackSelect value={track} onChange={setTrack} />
                  </div>

                  <SectionDivider label="Race Distance" />

                  {/* Laps */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2.5">
                      <Label>Total Laps</Label>
                      <span className="text-white font-mono font-bold text-base">{laps}</span>
                    </div>
                    <input
                      type="range" min={20} max={78} value={laps}
                      onChange={e => setLaps(Number(e.target.value))}
                      className="w-full h-1 rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-[#444] mt-1.5">
                      <span>20 laps</span><span>78 laps</span>
                    </div>
                  </div>

                  <SectionDivider label="Tyre Selection" />

                  {/* Starting tyre */}
                  <div>
                    <Label>Starting Compound</Label>
                    <div className="space-y-1.5">
                      {TYRES.map(t => (
                        <button
                          key={t}
                          onClick={() => setStartTyre(t)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded border text-xs font-semibold transition-all
                            ${startTyre === t
                              ? "border-f1red bg-f1red/10 text-white"
                              : "border-[#1E1E1E] bg-black text-[#888] hover:border-[#333] hover:text-white"}`}
                        >
                          <TyreBadge tyre={t} size="sm" />
                          <div className="text-left flex-1">
                            <span className="block font-bold">{t}</span>
                            <span className="text-[10px] opacity-60 font-normal">{TYRE_HINT[t]}</span>
                          </div>
                          {startTyre === t && (
                            <div className="w-1.5 h-1.5 rounded-full bg-f1red" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SectionDivider label="Conditions" />

                  {/* Weather */}
                  <div>
                    <Label>Weather</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Dry","Mixed","Wet"] as Weather[]).map(w => (
                        <Pill key={w}
                          label={w === "Dry" ? "☀ Dry" : w === "Mixed" ? "🌦 Mixed" : "🌧 Wet"}
                          selected={weather === w} onClick={() => setWeather(w)} />
                      ))}
                    </div>
                  </div>

                  {/* Safety car */}
                  <div>
                    <Label>Safety Car Risk</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Low","Medium","High"] as const).map(s => (
                        <Pill key={s} label={s} selected={safetyCar === s} onClick={() => setSafetyCar(s)} />
                      ))}
                    </div>
                  </div>

                  <SectionDivider label="Strategy Mode" />

                  {/* Strategy */}
                  <div>
                    <Label>Approach</Label>
                    <div className="space-y-1.5">
                      {(["Aggressive","Balanced","Conservative"] as StrategyType[]).map(s => (
                        <Pill key={s} label={s} selected={strategy === s}
                          onClick={() => setStrategy(s)} hint={STRATEGY_DESC[s]} />
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Run / Reset buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRun}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-f1red hover:bg-red-600 disabled:opacity-40 text-white font-black text-xs tracking-[0.15em] uppercase py-4 rounded transition-all glow-red hover:scale-[1.01] active:scale-100"
                >
                  {loading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating</>
                  ) : (
                    <><Play size={14} /> Run Strategy</>
                  )}
                </button>
                {result && (
                  <button
                    onClick={handleReset}
                    className="px-4 border border-[#1E1E1E] rounded text-[#555] hover:text-white hover:border-[#444] transition-all"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: Results ───────────────────────────────────────── */}
            <div className="space-y-5">
              {!result && !loading && (
                <div className="bg-[#0D0D0D] border border-dashed border-[#222] rounded-xl flex flex-col items-center justify-center py-28 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-[#111] border border-[#1E1E1E] flex items-center justify-center mb-5 text-2xl">🏁</div>
                  <p className="text-white font-bold mb-2">No strategy yet</p>
                  <p className="text-[#555] text-sm max-w-xs leading-relaxed">
                    Configure parameters and press <span className="text-f1red font-semibold">Run Strategy</span> to compute the optimal pit plan.
                  </p>
                </div>
              )}

              {loading && (
                <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl flex flex-col items-center justify-center py-28 text-center px-6">
                  <div className="w-12 h-12 border-[3px] border-f1red/20 border-t-f1red rounded-full animate-spin mb-6" />
                  <p className="text-white font-bold mb-1">Simulating {laps} laps</p>
                  <p className="text-[#555] text-sm">{track} Grand Prix · {strategy}</p>
                </div>
              )}

              {result && !loading && (
                <>
                  <ResultCard result={result} />
                  <AIAnalysisCard
                    analysis={analysis}
                    loading={analysisLoading}
                    error={analysisError}
                    disabled={!result}
                    limitReached={dailyLimitReached}
                    limitMessage={dailyLimitMessage}
                    onGenerate={handleGenerateAnalysis}
                  />
                  <LapTimeChart lapData={result.lapData} pitStops={result.pitStops} />
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
