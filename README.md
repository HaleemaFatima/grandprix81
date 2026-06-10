# GrandPrix81 🏎

**Live Site:** [grandprix81.vercel.app](https://grandprix81.vercel.app)

An AI-powered Formula 1 race strategy simulator. Configure your circuit, tyres, weather, and strategy mode — the engine computes your optimal pit window, tyre sequence, and projected race time lap by lap.

---

## What It Does

GrandPrix81 lets you think like an F1 strategy engineer. Select your race parameters and the rule-based engine returns:

- Recommended tyre sequence (e.g. Soft → Medium → Hard)
- Optimal pit stop laps
- Estimated total race time
- Risk level assessment (Low / Medium / High)
- Lap-by-lap degradation chart with pit stop markers
- Full strategy breakdown explaining every decision

---

## Features

- **24 Circuits** — All current F1 venues with track-specific lap time multipliers
- **5 Tyre Compounds** — Soft, Medium, Hard, Intermediate, Wet
- **3 Strategy Modes** — Aggressive, Balanced, Conservative
- **Weather Scenarios** — Dry, Mixed, Wet conditions affect compound choice and lap times
- **Safety Car Risk** — Low / Medium / High probability shifts pit windows by up to 16 seconds
- **Degradation Modelling** — Tyre cliff simulation where wear accelerates past a threshold lap
- **Live Chart** — Recharts-powered visualisation of lap time progression across full race distance

---

## Built With

| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org) | React framework, app router |
| [Tailwind CSS](https://tailwindcss.com) | Styling and dark theme |
| [Recharts](https://recharts.org) | Lap time degradation chart |
| [Lucide React](https://lucide.dev) | Icons |
| [Vercel](https://vercel.com) | Deployment |

---

## Project Structure

```
grandprix81/
├── app/
│   ├── layout.tsx                 ← Root layout, metadata, fonts
│   ├── globals.css                ← Global styles, F1 dark theme
│   ├── page.tsx                   ← Homepage
│   ├── simulator/
│   │   └── page.tsx               ← Simulator page (form + results)
│   └── components/
│       ├── Navbar.tsx             ← Fixed top navigation bar
│       ├── TrackSelect.tsx        ← Custom circuit dropdown
│       ├── TyreBadge.tsx          ← Coloured tyre compound pill
│       ├── LapTimeChart.tsx       ← Recharts degradation chart
│       └── ResultCard.tsx         ← Strategy output card
├── lib/
│   └── strategyEngine.ts          ← Rule-based race strategy brain
├── tailwind.config.ts             ← F1 colour palette
└── package.json
```

---

## How the Strategy Engine Works

The engine lives in `lib/strategyEngine.ts` and models real F1 logic:

**1. Tyre Sequencing**
Compounds are chosen based on starting tyre, weather, strategy mode, and total lap count. Wet conditions override all dry logic. Aggressive mode favours Soft-heavy sequences; Conservative mode extends Hard stints.

**2. Pit Windows**
Total laps are divided evenly between stints. Aggressive mode pits 3 laps earlier; Conservative pits 3 laps later. High safety car risk shifts pit laps earlier to exploit yellow flag windows.

**3. Degradation Model**
Each compound has a base lap time, a degradation rate per lap, and a cliff lap where wear suddenly accelerates:

| Compound | Base Time | Deg/Lap | Cliff Lap |
|----------|-----------|---------|-----------|
| Soft | 88s | +0.18s | Lap 18 |
| Medium | 90s | +0.10s | Lap 28 |
| Hard | 92s | +0.06s | Lap 38 |
| Intermediate | 98s | +0.14s | Lap 22 |
| Wet | 105s | +0.09s | Lap 30 |

**4. Track Multipliers**
All 24 circuits have a time multiplier based on real lap characteristics. Monaco (+8%) is the slowest; Monza (-9%) the fastest.

**5. Safety Car Benefit**
Pitting under a safety car saves up to 16 seconds in pit stop cost depending on SC risk level.

**6. Risk Scoring**
Combines tyre softness, number of Soft stints, weather uncertainty, SC probability, and strategy aggressiveness into a Low / Medium / High risk rating.

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/yourusername/grandprix81.git
cd grandprix81

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `f1red` | `#E8002D` | Primary accent, buttons, highlights |
| `f1dark` | `#000000` | Page background |
| `f1panel` | `#0D0D0D` | Cards and panels |
| `f1border` | `#1E1E1E` | Borders and dividers |
| `f1muted` | `#888888` | Subtext and labels |
| `f1yellow` | `#FFD700` | Medium tyre, stat accents |
| `f1teal` | `#00D2BE` | Pit stop markers on chart |

---

## Deploying to Vercel

This project is deployed on Vercel. To deploy your own copy:

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects Next.js — just click Deploy
4. Your site will be live in under a minute

---

## Disclaimer

GrandPrix81 is a fan-made project for educational and entertainment purposes. It is not affiliated with, endorsed by, or connected to Formula 1, FOM, FIA, or any F1 team.

---

*Built by a beginner with zero prior coding experience.* 🏁
