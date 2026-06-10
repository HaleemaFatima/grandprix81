"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";

const TRACKS = [
  "Bahrain","Saudi Arabia","Australia","Japan","China","Miami",
  "Emilia Romagna","Monaco","Canada","Spain","Austria","Great Britain",
  "Hungary","Belgium","Netherlands","Italy","Azerbaijan","Singapore",
  "USA (COTA)","Mexico","Brazil","Las Vegas","Qatar","Abu Dhabi",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function TrackSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all
          bg-black text-white
          ${open ? "border-f1red shadow-[0_0_0_1px_rgba(232,0,45,0.3)]" : "border-[#1E1E1E] hover:border-[#333]"}`}
      >
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-f1red shrink-0" />
          <span>{value} Grand Prix</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-f1muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#1E1E1E] bg-[#0D0D0D] shadow-2xl overflow-hidden">
          {/* Red top accent */}
          <div className="h-[2px] bg-f1red" />

          <div className="max-h-64 overflow-y-auto py-1">
            {TRACKS.map((track) => {
              const selected = track === value;
              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => { onChange(track); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                    ${selected
                      ? "bg-f1red text-white font-semibold"
                      : "text-[#CCCCCC] hover:bg-white/5 hover:text-white"}`}
                >
                  <span className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: selected ? "white" : "transparent" }} />
                  {track} Grand Prix
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}