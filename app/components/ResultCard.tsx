"use client";
import { StrategyResult, formatTime, formatLapTime } from "@/lib/strategyEngine";
import TyreBadge from "./TyreBadge";
import { AlertTriangle, CheckCircle, Zap, Clock, Flag, Info } from "lucide-react";

const RISK_CONFIG = {
  Low:    { color: "text-green-400",  border: "border-green-500/30", bg: "bg-green-500/8",  icon: CheckCircle,  bar: "bg-green-500" },
  Medium: { color: "text-f1yellow",   border: "border-f1yellow/30",  bg: "bg-f1yellow/8",   icon: AlertTriangle, bar: "bg-f1yellow" },
  High:   { color: "text-f1red",      border: "border-f1red/30",     bg: "bg-f1red/8",      icon: Zap,           bar: "bg-f1red" },
};

export default function ResultCard({ result }: { result: StrategyResult }) {
  const risk    = RISK_CONFIG[result.riskLevel];
  const RIcon   = risk.icon;
  const avgLap  = result.lapData.reduce((s, d) => s + d.lapTime, 0) / result.lapData.length;
  const fastest = Math.min(...result.lapData.map(d => d.lapTime));

  return (
    <div className="space-y-3 slide-up">

      {/* ── Best strategy banner ──────────────────────────────── */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
        <div className="h-[2px] bg-f1red" />
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase mb-1">Recommended Strategy</p>
            <h2 className="text-white font-bold text-sm leading-snug">{result.bestStrategy}</h2>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-bold shrink-0 ${risk.color} ${risk.border} ${risk.bg}`}>
            <RIcon size={11} />
            {result.riskLevel} Risk
          </div>
        </div>
      </div>

      {/* ── Stats grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Race Time", value: formatTime(result.estimatedRaceTime), icon: Clock,        color: "text-f1red" },
          { label: "Pit Stops", value: result.pitStops.length.toString(),    icon: Flag,         color: "text-white" },
          { label: "Avg Lap",   value: formatLapTime(avgLap),                icon: Zap,          color: "text-[#888]" },
          { label: "Fastest",   value: formatLapTime(fastest),               icon: CheckCircle,  color: "text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-4">
            <Icon size={14} className={`${color} mb-2`} />
            <p className="text-white font-black text-lg font-mono">{value}</p>
            <p className="text-[#555] text-[10px] tracking-wide mt-0.5 uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tyre stint plan ───────────────────────────────────── */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-5">
        <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase mb-4">Tyre Stint Plan</p>
        <div className="flex items-center gap-3 flex-wrap">
          {result.tyreSequence.map((tyre, i) => (
            <div key={i} className="flex items-center gap-2">
              <TyreBadge tyre={tyre} size="lg" />
              <div>
                <p className="text-white text-xs font-semibold">{tyre}</p>
                <p className="text-[#444] text-[10px]">
                  {result.pitStops[i] ? `→ Pit Lap ${result.pitStops[i].lap}` : "→ Finish"}
                </p>
              </div>
              {i < result.tyreSequence.length - 1 && (
                <span className="text-[#333] text-lg mx-1">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Pit stop table */}
        {result.pitStops.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1A1A1A] space-y-2">
            {result.pitStops.map((pit, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-f1red/15 text-f1red flex items-center justify-center font-black text-[10px] shrink-0">
                  {i + 1}
                </div>
                <TyreBadge tyre={pit.fromTyre} size="sm" />
                <span className="text-[#333]">→</span>
                <TyreBadge tyre={pit.toTyre} size="sm" />
                <span className="text-[#555]">Lap</span>
                <span className="text-white font-mono font-bold">{pit.lap}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Explanation ───────────────────────────────────────── */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={13} className="text-f1red" />
          <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase">Strategy Breakdown</p>
        </div>
        <p className="text-[#999] text-sm leading-relaxed">{result.explanation}</p>

        {/* Degradation bar */}
        <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
          <div className="flex justify-between text-[10px] text-[#555] mb-2">
            <span>Avg Tyre Degradation</span>
            <span className="text-white font-mono">+{result.degradationRate}s / lap</span>
          </div>
          <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className={`h-full fill-bar rounded-full ${risk.bar}`}
              style={{ width: `${Math.min(result.degradationRate / 0.25 * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#333] mt-1">
            <span>Low</span><span>High</span>
          </div>
        </div>
      </div>

    </div>
  );
}
