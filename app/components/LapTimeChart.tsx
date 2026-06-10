// components/LapTimeChart.tsx — Recharts line chart showing lap time degradation
"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { DotItemDotProps } from "recharts";
import { LapDataPoint, PitStop, formatLapTime } from "@/lib/strategyEngine";

interface Props {
  lapData: LapDataPoint[];
  pitStops: PitStop[];
}

const TYRE_COLOR: Record<string, string> = {
  Soft:         "#E8002D",
  Medium:       "#FFD700",
  Hard:         "#E5E5E5",
  Intermediate: "#4CAF50",
  Wet:          "#2196F3",
};

type TooltipPayload = {
  payload?: LapDataPoint;
};

// Custom tooltip shown when hovering the chart
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number | string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-f1panel border border-f1border rounded-lg px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-f1muted mb-1">LAP {label}</p>
      <p className="text-f1white font-bold text-sm">{formatLapTime(d.lapTime)}</p>
      <p style={{ color: TYRE_COLOR[d.compound] }} className="mt-1 font-semibold">
        {d.compound} · Age {d.tyreAge}
      </p>
    </div>
  );
}

export default function LapTimeChart({ lapData, pitStops }: Props) {
  // Convert lap time seconds → "M:SS.s" label for Y axis
  const yTickFormatter = (val: number) => formatLapTime(val);

  // Find Y domain
  const times = lapData.map(d => d.lapTime);
  const minT = Math.floor(Math.min(...times)) - 1;
  const maxT = Math.ceil(Math.max(...times)) + 1;

  return (
    <div className="bg-f1panel border border-f1border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-f1white font-bold text-sm tracking-widest uppercase">Lap Time Degradation</h3>
          <p className="text-f1muted text-xs mt-0.5">Projected time per lap across full race distance</p>
        </div>
        {/* Pit stop legend */}
        <div className="flex items-center gap-2 text-xs text-f1muted">
          <div className="w-4 h-0.5 bg-f1teal border-dashed border-t border-f1teal" />
          <span>Pit Stop</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lapData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2B30" vertical={false} />

          <XAxis
            dataKey="lap"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={{ stroke: "#2A2B30" }}
            tickLine={false}
            label={{ value: "Lap", position: "insideBottomRight", offset: -5, fill: "#6B7280", fontSize: 10 }}
          />

          <YAxis
            domain={[minT, maxT]}
            tickFormatter={yTickFormatter}
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Pit stop reference lines */}
          {pitStops.map((pit, i) => (
            <ReferenceLine
              key={i}
              x={pit.lap}
              stroke="#00D2BE"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `P${i + 1}`, fill: "#00D2BE", fontSize: 9, position: "top" }}
            />
          ))}

          {/* Main lap time line — colour changes by compound */}
          <Line
            type="monotone"
            dataKey="lapTime"
            stroke="#E8002D"
            strokeWidth={2}
            dot={(props: DotItemDotProps) => {
              const compound = props.payload?.compound as string | undefined;
              const color = compound ? TYRE_COLOR[compound] ?? "#E8002D" : "#E8002D";
              // Only render a dot at compound change points (pit stops)
              const isPit = pitStops.some(p => p.lap === props.payload?.lap);
              if (!isPit) return <circle cx={props.cx} cy={props.cy} r={0} />;
              return <circle cx={props.cx} cy={props.cy} r={4} fill={color} stroke="#08090A" strokeWidth={2} />;
            }}
            activeDot={{ r: 5, fill: "#E8002D", stroke: "#08090A", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Tyre compound colour legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {Object.entries(TYRE_COLOR).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5 text-xs text-f1muted">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
