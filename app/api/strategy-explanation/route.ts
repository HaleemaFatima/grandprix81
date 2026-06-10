import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StrategyExplanationRequest = {
  track: string;
  totalLaps: number;
  startingTyre: string;
  weather: string;
  safetyCarRisk: string;
  strategyMode: string;
  tyreSequence: string[];
  pitWindow: string;
  estimatedRaceTime: string;
  riskLevel: string;
  explanation: string;
};

type StrategyExplanationResponse = {
  strategySummary: string;
  tyreReasoning: string;
  pitWindowLogic: string;
  riskAnalysis: string;
  pitWallVerdict: string;
  source: "gemini" | "fallback";
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    strategySummary: { type: Type.STRING },
    tyreReasoning: { type: Type.STRING },
    pitWindowLogic: { type: Type.STRING },
    riskAnalysis: { type: Type.STRING },
    pitWallVerdict: { type: Type.STRING },
  },
  required: [
    "strategySummary",
    "tyreReasoning",
    "pitWindowLogic",
    "riskAnalysis",
    "pitWallVerdict",
  ],
  propertyOrdering: [
    "strategySummary",
    "tyreReasoning",
    "pitWindowLogic",
    "riskAnalysis",
    "pitWallVerdict",
  ],
} as const;

function toSentenceList(items: string[]): string {
  if (items.length === 0) return "No tyre sequence was provided.";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildFallbackAnalysis(input: StrategyExplanationRequest): StrategyExplanationResponse {
  const pitWindowText = input.pitWindow || "No pit stop is required";
  const tyreFlow = toSentenceList(input.tyreSequence);

  return {
    strategySummary: `The rule engine favors a ${input.strategyMode.toLowerCase()} plan at ${input.track} over ${input.totalLaps} laps. It projects a ${input.estimatedRaceTime} race with ${input.riskLevel.toLowerCase()} risk, and the explanation from the strategy engine remains the source of truth.`,
    tyreReasoning: `The sequence moves through ${tyreFlow}, which matches the track demand, weather (${input.weather}), and the starting tyre choice of ${input.startingTyre}. The rule engine is prioritizing tyre life and pace balance rather than letting the AI invent a new strategy.`,
    pitWindowLogic: `The pit window is centered on ${pitWindowText}. That timing follows the rule-engine logic in the original explanation: ${input.explanation}`,
    riskAnalysis: `Risk sits at ${input.riskLevel}. Safety car risk is ${input.safetyCarRisk}, so the plan is balancing track position against pit-lane exposure while staying inside the existing strategy output.`,
    pitWallVerdict: `Pit wall verdict: keep the rule-engine plan intact, use this as a commentary layer only, and execute the existing tyre sequence and pit timing unless race conditions change.`,
    source: "fallback",
  };
}

function normalizeAnalysis(value: unknown, fallback: StrategyExplanationRequest): StrategyExplanationResponse {
  if (!value || typeof value !== "object") {
    return buildFallbackAnalysis(fallback);
  }

  const candidate = value as Partial<Record<keyof StrategyExplanationResponse, unknown>>;

  const strategySummary = typeof candidate.strategySummary === "string" ? candidate.strategySummary : "";
  const tyreReasoning = typeof candidate.tyreReasoning === "string" ? candidate.tyreReasoning : "";
  const pitWindowLogic = typeof candidate.pitWindowLogic === "string" ? candidate.pitWindowLogic : "";
  const riskAnalysis = typeof candidate.riskAnalysis === "string" ? candidate.riskAnalysis : "";
  const pitWallVerdict = typeof candidate.pitWallVerdict === "string" ? candidate.pitWallVerdict : "";

  if (!strategySummary || !tyreReasoning || !pitWindowLogic || !riskAnalysis || !pitWallVerdict) {
    return buildFallbackAnalysis(fallback);
  }

  return {
    strategySummary,
    tyreReasoning,
    pitWindowLogic,
    riskAnalysis,
    pitWallVerdict,
    source: "gemini",
  };
}

function buildPrompt(input: StrategyExplanationRequest) {
  return [
    "You are the pit wall strategist at GrandPrix81.",
    "Explain the existing rule-engine strategy result, but do not change, optimize, or re-decide the strategy.",
    "Treat the provided rule engine explanation as the source of truth.",
    "Use only the supplied data.",
    "Return concise, professional race engineering commentary in plain English.",
    "Write exactly five fields: strategySummary, tyreReasoning, pitWindowLogic, riskAnalysis, and pitWallVerdict.",
    "",
    `Track: ${input.track}`,
    `Total laps: ${input.totalLaps}`,
    `Starting tyre: ${input.startingTyre}`,
    `Weather: ${input.weather}`,
    `Safety car risk: ${input.safetyCarRisk}`,
    `Strategy mode: ${input.strategyMode}`,
    `Tyre sequence: ${input.tyreSequence.join(" -> ") || "Not provided"}`,
    `Pit window: ${input.pitWindow}`,
    `Estimated race time: ${input.estimatedRaceTime}`,
    `Risk level: ${input.riskLevel}`,
    `Rule engine explanation: ${input.explanation}`,
  ].join("\n");
}

export async function POST(request: Request) {
  let payload: StrategyExplanationRequest;

  try {
    payload = (await request.json()) as StrategyExplanationRequest;
  } catch {
    return Response.json(
      {
        error: "Invalid request payload.",
        ...buildFallbackAnalysis({
          track: "Unknown track",
          totalLaps: 0,
          startingTyre: "Unknown tyre",
          weather: "Unknown",
          safetyCarRisk: "Unknown",
          strategyMode: "Unknown",
          tyreSequence: [],
          pitWindow: "Unknown",
          estimatedRaceTime: "Unknown",
          riskLevel: "Unknown",
          explanation: "No rule-engine explanation was provided.",
        }),
      },
      { status: 200 },
    );
  }

  const fallback = buildFallbackAnalysis(payload);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(fallback, { status: 200 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(payload),
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.4,
      },
    });

    const rawText = response.text?.trim() ?? "";
    const parsed = rawText ? JSON.parse(rawText) : null;

    return Response.json(normalizeAnalysis(parsed, payload), { status: 200 });
  } catch (error) {
    console.error("Gemini strategy explanation failed:", error);
    return Response.json(fallback, { status: 200 });
  }
}
