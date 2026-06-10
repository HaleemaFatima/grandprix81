"use client";

import type { ComponentType, SVGProps } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Sparkles, Shield, Target } from "lucide-react";

export type StrategyAnalysis = {
  strategySummary: string;
  tyreReasoning: string;
  pitWindowLogic: string;
  riskAnalysis: string;
  pitWallVerdict: string;
  source: "gemini" | "fallback";
};

type AIAnalysisCardProps = {
  analysis: StrategyAnalysis | null;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  limitReached: boolean;
  limitMessage: string;
  onGenerate: () => void;
};

type AnalysisKey = Exclude<keyof StrategyAnalysis, "source">;

const SECTION_META = [
  { key: "strategySummary", label: "Strategy Summary", icon: Target },
  { key: "tyreReasoning", label: "Tyre Reasoning", icon: Shield },
  { key: "pitWindowLogic", label: "Pit Window Logic", icon: ClockIcon },
  { key: "riskAnalysis", label: "Risk Analysis", icon: AlertTriangle },
  { key: "pitWallVerdict", label: "Pit Wall Verdict", icon: CheckCircle2 },
] as const satisfies ReadonlyArray<{
  key: AnalysisKey;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}>;

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function AIAnalysisCard({
  analysis,
  loading,
  error,
  disabled,
  limitReached,
  limitMessage,
  onGenerate,
}: AIAnalysisCardProps) {
  const buttonDisabled = disabled || loading || limitReached;

  return (
    <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
      <div className="h-[2px] bg-gradient-to-r from-f1red via-f1red/60 to-f1yellow/80" />

      <div className="p-5 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-f1red" />
              <p className="text-[#555] text-[10px] tracking-[0.15em] uppercase">AI Strategist Analysis</p>
            </div>
            <h3 className="text-white text-lg font-black tracking-tight">Gemini explains the rule-engine result</h3>
            <p className="text-[#777] text-sm leading-relaxed max-w-2xl mt-2">
              This layer only interprets the existing strategy output. It does not choose tyres, alter pit windows, or replace the rule engine.
            </p>
          </div>

          <button
            onClick={onGenerate}
            disabled={buttonDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-f1red/40 bg-f1red/10 px-4 py-3 text-xs font-black tracking-[0.15em] uppercase text-white transition-all hover:bg-f1red/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {limitReached ? (
              <>
                <AlertTriangle size={14} />
                Daily limit reached
              </>
            ) : loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate AI Strategist Analysis
              </>
            )}
          </button>
        </div>

        {disabled && !analysis && (
          <div className="flex items-start gap-3 rounded-lg border border-[#242424] bg-black/40 p-4 text-sm text-[#8a8a8a]">
            <Info size={16} className="mt-0.5 shrink-0 text-f1yellow" />
            <p>Run a strategy first to generate the AI explanation card.</p>
          </div>
        )}

        {limitReached && (
          <div className="flex items-start gap-3 rounded-lg border border-f1yellow/25 bg-f1yellow/8 p-4 text-sm text-f1yellow">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>{limitMessage}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-f1red/25 bg-f1red/8 p-4 text-sm text-red-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-f1red" />
            <p>{error}</p>
          </div>
        )}

        {analysis ? (
          <>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#2A2A2A] bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa]">
                {analysis.source === "gemini" ? "Gemini" : "Local fallback"}
              </span>
              {analysis.source === "fallback" && (
                <span className="rounded-full border border-f1yellow/30 bg-f1yellow/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-f1yellow">
                  Fallback explanation
                </span>
              )}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {SECTION_META.map(({ key, label, icon: Icon }) => (
                <article key={key} className="rounded-xl border border-[#1C1C1C] bg-black/55 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={14} className="text-f1red" />
                    <h4 className="text-white text-xs font-black tracking-[0.15em] uppercase">{label}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-[#a0a0a0]">
                    {analysis[key]}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[#232323] bg-black/35 p-6 text-sm text-[#7f7f7f]">
            The AI card will appear here after the first strategy run.
          </div>
        )}
      </div>
    </section>
  );
}
