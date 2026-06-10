# 🏎 RaceIQ — F1 Race Strategy Simulator

An AI-powered Formula 1 race strategy simulator built with **Next.js 14**, **Tailwind CSS**, and **Recharts**.

---

## Project Structure

```
raceiq/
├── app/
│   ├── layout.tsx          ← Root layout (fonts, metadata)
│   ├── globals.css         ← F1 dark theme, custom animations
│   ├── page.tsx            ← Homepage
│   ├── simulator/
│   │   └── page.tsx        ← Main simulator (form + results)
│   └── components/
│       ├── Navbar.tsx      ← Top navigation bar
│       ├── TyreBadge.tsx   ← Coloured tyre compound pill
│       ├── LapTimeChart.tsx← Recharts degradation chart
│       └── ResultCard.tsx  ← Strategy result display
├── lib/
│   └── strategyEngine.ts   ← Rule-based race strategy brain
├── tailwind.config.ts      ← F1 colour palette
└── package.json
```

---

## Setup (Step by Step)

### Step 1 — Install Node.js
Download Node.js 18+ from https://nodejs.org and install it.

### Step 2 — Create the project folder
Unzip this project or copy the files into a folder on your computer.

### Step 3 — Install dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### Step 4 — Start the development server
```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

---

## How the Strategy Engine Works (`lib/strategyEngine.ts`)

The engine uses real F1 logic to recommend tyres:

1. **Tyre Selection** — Based on starting compound, weather, strategy mode, and lap count
2. **Pit Windows** — Calculated by dividing total laps equally between stints, adjusted for strategy aggressiveness
3. **Degradation Model** — Each compound has a base time, degradation rate per lap, and a "cliff" lap where wear accelerates
4. **Safety Car Benefit** — High SC risk shifts pit laps earlier and reduces pit stop cost
5. **Track Multiplier** — Each of the 24 circuits has a time multiplier based on real lap characteristics
6. **Risk Assessment** — Combines tyre softness, weather, SC probability, and strategy mode

---

## Colour Palette

| Name       | Hex       | Usage                    |
|------------|-----------|--------------------------|
| f1red      | `#E8002D` | Primary accent, CTAs     |
| f1dark     | `#08090A` | Background               |
| f1panel    | `#15161A` | Cards, panels            |
| f1border   | `#2A2B30` | Borders, dividers        |
| f1muted    | `#6B7280` | Subtext, labels          |
| f1yellow   | `#FFD700` | Medium tyre, stats       |
| f1teal     | `#00D2BE` | Pit stop markers, engine |
