// components/TyreBadge.tsx — Coloured pill showing tyre compound
import { Tyre } from "@/lib/strategyEngine";

const COLOURS: Record<Tyre, string> = {
  Soft:         "bg-f1red text-white",
  Medium:       "bg-f1yellow text-black",
  Hard:         "bg-gray-200 text-black",
  Intermediate: "bg-green-500 text-white",
  Wet:          "bg-blue-500 text-white",
};

const SYMBOL: Record<Tyre, string> = {
  Soft:         "S",
  Medium:       "M",
  Hard:         "H",
  Intermediate: "I",
  Wet:          "W",
};

export default function TyreBadge({ tyre, size = "md" }: { tyre: Tyre; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} ${COLOURS[tyre]} rounded-full flex items-center justify-center font-black leading-none select-none`}
         title={tyre}>
      {SYMBOL[tyre]}
    </div>
  );
}
