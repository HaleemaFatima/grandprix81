// ─────────────────────────────────────────────────────────────────────────────
// RaceIQ Strategy Engine  (lib/strategyEngine.ts)
// Rule-based logic that mirrors real F1 tyre and pit strategy decisions.
// ─────────────────────────────────────────────────────────────────────────────

export type Tyre = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet";
export type Weather = "Dry" | "Mixed" | "Wet";
export type StrategyType = "Aggressive" | "Balanced" | "Conservative";

export interface SimInput {
  track: string;
  totalLaps: number;
  startingTyre: Tyre;
  weather: Weather;
  safetyCar: "Low" | "Medium" | "High";
  strategy: StrategyType;
}

export interface PitStop {
  lap: number;
  fromTyre: Tyre;
  toTyre: Tyre;
}

export interface LapDataPoint {
  lap: number;
  lapTime: number;   // seconds
  tyreAge: number;
  compound: Tyre;
}

export interface StrategyResult {
  tyreSequence: Tyre[];
  pitStops: PitStop[];
  lapData: LapDataPoint[];
  estimatedRaceTime: number;   // seconds
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
  bestStrategy: string;
  degradationRate: number;
}

// ── Base lap times per compound (seconds) ─────────────────────────────────
const BASE_LAP_TIME: Record<Tyre, number> = {
  Soft:         88,
  Medium:       90,
  Hard:         92,
  Intermediate: 98,
  Wet:         105,
};

// ── Degradation per lap (seconds added per lap of tyre age) ───────────────
const DEGRADATION: Record<Tyre, number> = {
  Soft:         0.18,
  Medium:       0.10,
  Hard:         0.06,
  Intermediate: 0.14,
  Wet:          0.09,
};

// ── Cliff lap (where degradation suddenly worsens) ────────────────────────
const CLIFF_LAP: Record<Tyre, number> = {
  Soft:         18,
  Medium:       28,
  Hard:         38,
  Intermediate: 22,
  Wet:          30,
};

// ── Safety car time benefit (seconds shaved off pit-stop cost) ────────────
const SC_BENEFIT: Record<"Low" | "Medium" | "High", number> = {
  Low:    0,
  Medium: 8,
  High:   16,
};

const PIT_STOP_COST = 22; // seconds lost in the pits

// ── Track-specific base multiplier ───────────────────────────────────────
const TRACK_MULTIPLIER: Record<string, number> = {
  "Bahrain":          1.00,
  "Saudi Arabia":     0.95,
  "Australia":        0.97,
  "Japan":            1.02,
  "China":            0.98,
  "Miami":            0.96,
  "Emilia Romagna":   1.01,
  "Monaco":           1.08,
  "Canada":           0.99,
  "Spain":            1.00,
  "Austria":          0.93,
  "Great Britain":    1.01,
  "Hungary":          1.04,
  "Belgium":          0.97,
  "Netherlands":      1.00,
  "Italy":            0.91,
  "Azerbaijan":       0.94,
  "Singapore":        1.10,
  "USA (COTA)":       1.00,
  "Mexico":           1.03,
  "Brazil":           0.99,
  "Las Vegas":        0.92,
  "Qatar":            1.01,
  "Abu Dhabi":        0.98,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main engine
// ─────────────────────────────────────────────────────────────────────────────
export function runStrategy(input: SimInput): StrategyResult {
  const { totalLaps, startingTyre, weather, safetyCar, strategy, track } = input;
  const trackMult = TRACK_MULTIPLIER[track] ?? 1.0;

  // ── Choose tyre sequence based on inputs ──────────────────────────────
  const tyreSequence: Tyre[] = chooseTyreSequence(startingTyre, weather, strategy, totalLaps);

  // ── Calculate pit laps ────────────────────────────────────────────────
  const pitStops = calcPitStops(tyreSequence, totalLaps, strategy, safetyCar);

  // ── Build lap-by-lap data ─────────────────────────────────────────────
  const lapData = buildLapData(tyreSequence, pitStops, totalLaps, trackMult, weather);

  // ── Total race time ───────────────────────────────────────────────────
  const pitTimeCost = pitStops.length * (PIT_STOP_COST - SC_BENEFIT[safetyCar]);
  const rollingTime = lapData.reduce((s, d) => s + d.lapTime, 0);
  const estimatedRaceTime = rollingTime + pitTimeCost;

  // ── Risk assessment ───────────────────────────────────────────────────
  const riskLevel = assessRisk(tyreSequence, safetyCar, weather, strategy);

  // ── Explanation ───────────────────────────────────────────────────────
  const explanation = buildExplanation(tyreSequence, pitStops, riskLevel, weather, safetyCar, strategy, totalLaps);
  const bestStrategy = describeBestStrategy(tyreSequence, pitStops, totalLaps);

  const avgDeg = tyreSequence.reduce((s, t) => s + DEGRADATION[t], 0) / tyreSequence.length;

  return {
    tyreSequence,
    pitStops,
    lapData,
    estimatedRaceTime,
    riskLevel,
    explanation,
    bestStrategy,
    degradationRate: Math.round(avgDeg * 100) / 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function chooseTyreSequence(start: Tyre, weather: Weather, strategy: StrategyType, laps: number): Tyre[] {
  // Wet conditions override all
  if (weather === "Wet") return ["Wet", "Wet"];
  if (weather === "Mixed") return ["Intermediate", "Medium"];

  // Dry logic based on strategy
  if (laps <= 30) {
    // Sprint-like: 1 stop or 2 short stints
    if (strategy === "Aggressive") return ["Soft", "Soft"];
    if (strategy === "Conservative") return ["Medium", "Hard"];
    return ["Soft", "Medium"];
  }

  if (laps <= 50) {
    if (strategy === "Aggressive") return ["Soft", "Soft", "Medium"];
    if (strategy === "Conservative") return ["Hard", "Medium"];
    // Balanced: honour starting tyre then extend
    if (start === "Soft") return ["Soft", "Medium", "Hard"];
    if (start === "Medium") return ["Medium", "Hard"];
    return ["Hard", "Medium"];
  }

  // Long race (50+)
  if (strategy === "Aggressive") return ["Soft", "Soft", "Medium", "Hard"];
  if (strategy === "Conservative") return ["Hard", "Medium", "Hard"];
  if (start === "Soft") return ["Soft", "Medium", "Hard"];
  if (start === "Medium") return ["Medium", "Soft", "Hard"];
  return ["Hard", "Medium", "Hard"];
}

function calcPitStops(tyres: Tyre[], totalLaps: number, strategy: StrategyType, sc: string): PitStop[] {
  const stops: PitStop[] = [];
  const stintCount = tyres.length;
  const stintLength = Math.floor(totalLaps / stintCount);

  for (let i = 0; i < stintCount - 1; i++) {
    let pitLap = stintLength * (i + 1);

    // Aggressive: pit earlier; Conservative: pit later
    if (strategy === "Aggressive") pitLap = Math.max(pitLap - 3, 1);
    if (strategy === "Conservative") pitLap = Math.min(pitLap + 3, totalLaps - 2);

    // Encourage pitting under safety car
    if (sc === "High") pitLap = Math.max(pitLap - 2, 1);

    stops.push({
      lap: Math.round(pitLap),
      fromTyre: tyres[i],
      toTyre: tyres[i + 1],
    });
  }
  return stops;
}

function buildLapData(
  tyres: Tyre[],
  pits: PitStop[],
  totalLaps: number,
  trackMult: number,
  weather: Weather,
): LapDataPoint[] {
  const data: LapDataPoint[] = [];
  let currentTyreIndex = 0;
  let tyreAge = 0;

  const weatherMult = weather === "Wet" ? 1.15 : weather === "Mixed" ? 1.06 : 1.0;

  for (let lap = 1; lap <= totalLaps; lap++) {
    // Check if we pit this lap
    const pit = pits.find(p => p.lap === lap);
    if (pit) {
      currentTyreIndex = Math.min(currentTyreIndex + 1, tyres.length - 1);
      tyreAge = 0;
    }

    const compound = tyres[currentTyreIndex];
    const base = BASE_LAP_TIME[compound] * trackMult * weatherMult;
    let deg = DEGRADATION[compound] * tyreAge;

    // Cliff effect: degradation doubles past cliff lap
    if (tyreAge > CLIFF_LAP[compound]) {
      const overCliff = tyreAge - CLIFF_LAP[compound];
      deg += DEGRADATION[compound] * overCliff * 1.5;
    }

    // Slight lap-to-lap randomness to make chart more realistic
    const noise = (Math.random() - 0.5) * 0.4;

    data.push({
      lap,
      lapTime: Math.round((base + deg + noise) * 10) / 10,
      tyreAge,
      compound,
    });

    tyreAge++;
  }

  return data;
}

function assessRisk(tyres: Tyre[], sc: "Low" | "Medium" | "High", weather: Weather, strategy: StrategyType): "Low" | "Medium" | "High" {
  let score = 0;
  if (tyres.includes("Soft")) score += 1;
  if (tyres.filter(t => t === "Soft").length >= 2) score += 1;
  if (sc === "High") score += 1;
  if (weather === "Mixed") score += 2;
  if (weather === "Wet") score += 1;
  if (strategy === "Aggressive") score += 1;
  if (strategy === "Conservative") score -= 1;
  if (score <= 1) return "Low";
  if (score <= 3) return "Medium";
  return "High";
}

function buildExplanation(
  tyres: Tyre[],
  pits: PitStop[],
  risk: string,
  weather: Weather,
  sc: string,
  strategy: StrategyType,
  totalLaps: number,
): string {
  const stops = pits.length;
  const tyreList = tyres.join(" → ");

  const weatherNote = weather === "Wet"
    ? "Wet track conditions require full wet tyres throughout most of the race."
    : weather === "Mixed"
    ? "Mixed conditions demand an early switch from Intermediates to slicks."
    : "Dry conditions allow pure tyre performance optimisation.";

  const scNote = sc === "High"
    ? "High safety car probability makes pitting under yellow a key advantage — timing your stop near laps with higher SC risk can save ~16 seconds."
    : sc === "Medium"
    ? "A moderate safety car chance means you should be ready to box early if the window opens."
    : "Low safety car risk means free-air racing — prioritise tyre windows over opportunistic pitting.";

  const stratNote = strategy === "Aggressive"
    ? "Aggressive strategy pushes Soft tyres hard early for track position, accepting a later tyre cliff."
    : strategy === "Conservative"
    ? "Conservative approach extends stints on durable compounds to reduce uncertainty and pit-lane exposure."
    : "Balanced strategy blends tyre performance windows with manageable degradation.";

  return `${weatherNote} ${scNote} The recommended ${stops}-stop plan (${tyreList}) targets optimal lap-time windows across ${totalLaps} laps. ${stratNote} Overall risk is rated ${risk}.`;
}

function describeBestStrategy(tyres: Tyre[], pits: PitStop[], totalLaps: number): string {
  const stints = tyres.map((t, i) => {
    const inLap = i === 0 ? 1 : pits[i - 1].lap + 1;
    const outLap = i === tyres.length - 1 ? totalLaps : pits[i].lap;
    return `${t} (Laps ${inLap}–${outLap})`;
  });
  return stints.join("  →  ");
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}
