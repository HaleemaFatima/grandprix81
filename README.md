<div align="center">

<img src="https://img.shields.io/badge/GRANDPRIX81-E8002D?style=for-the-badge&logoColor=white" height="40"/>

# 🏎 GrandPrix81

**An AI-powered Formula 1 race strategy simulator**

[![Live Site](https://img.shields.io/badge/LIVE%20SITE-grandprix81.vercel.app-E8002D?style=for-the-badge&logo=vercel&logoColor=white)](https://grandprix81.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

> *Pick your track, tyres, weather, and strategy mode.*
> *The engine calculates your optimal pit window, tyre sequence, and projected race time — lap by lap.*

<br/>

</div>

---

## 🏁 What is GrandPrix81?

GrandPrix81 lets you think like an F1 strategy engineer. Configure your race parameters and the rule-based engine instantly returns your optimal strategy — complete with a live lap time degradation chart, pit stop breakdown, and full risk analysis.

Built from scratch with **zero prior coding experience** as a guided project.

---

## ⚡ Features

| | Feature | Description |
|---|---|---|
| 🗺 | **24-Circuit Library** | All current F1 venues with track-specific lap time multipliers |
| 🧠 | **Rule-Based Strategy Engine** | Cliff modelling, safety car windows, compound sequencing |
| 📊 | **Live Degradation Chart** | Lap-by-lap tyre wear visualised with pit stop markers |
| ☀ | **Weather Scenarios** | Dry, Mixed, Wet — affects compounds and lap times |
| 🚨 | **Safety Car Risk** | SC probability shifts pit windows by up to 16 seconds |
| 🎯 | **3 Strategy Modes** | Aggressive, Balanced, or Conservative |
| 🏆 | **Risk Assessment** | Low / Medium / High rating for every strategy |

---

## 🛞 Tyre Degradation Model

| Compound | Base Lap | Degradation / Lap | Cliff Lap |
|----------|----------|-------------------|-----------|
| 🔴 Soft | 88s | +0.18s | Lap 18 |
| 🟡 Medium | 90s | +0.10s | Lap 28 |
| ⚪ Hard | 92s | +0.06s | Lap 38 |
| 🟢 Intermediate | 98s | +0.14s | Lap 22 |
| 🔵 Wet | 105s | +0.09s | Lap 30 |

> Past the cliff lap, degradation accelerates — just like in a real Grand Prix.

---

## 🧱 Tech Stack

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white) | React framework, App Router |
| ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white) | Styling and dark F1 theme |
| ![Recharts](https://img.shields.io/badge/Recharts-E8002D?logoColor=white) | Lap time degradation chart |
| ![Lucide](https://img.shields.io/badge/Lucide%20React-000?logoColor=white) | Icons |
| ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white) | Deployment |

---

## 📁 Project Structure

```
grandprix81/
├── app/
│   ├── layout.tsx                 ← Root layout and metadata
│   ├── globals.css                ← F1 dark theme and animations
│   ├── page.tsx                   ← Homepage
│   ├── simulator/
│   │   └── page.tsx               ← Simulator page
│   └── components/
│       ├── Navbar.tsx             ← Top navigation
│       ├── TrackSelect.tsx        ← Custom circuit dropdown
│       ├── TyreBadge.tsx          ← Tyre compound pill
│       ├── LapTimeChart.tsx       ← Degradation chart
│       └── ResultCard.tsx         ← Strategy result card
├── lib/
│   └── strategyEngine.ts          ← Race strategy brain
├── tailwind.config.ts             ← F1 colour palette
└── package.json
```

---

## 🚀 Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/grandprix81.git
cd grandprix81

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) 🏁

---

## 🎨 Colour Palette

```
#E8002D  ██  f1red    — Primary accent, buttons
#000000  ██  f1dark   — Page background
#0D0D0D  ██  f1panel  — Cards and panels
#FFD700  ██  f1yellow — Medium tyre, highlights
#00D2BE  ██  f1teal   — Pit stop markers
#888888  ██  f1muted  — Subtext and labels
```

---

## ☁️ Deploy Your Own

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects Next.js — click **Deploy**
4. Live in under a minute

---

<div align="center">

**Built by a beginner with zero prior coding experience 🏁**

[![Live](https://img.shields.io/badge/Try%20It%20Live-E8002D?style=for-the-badge&logo=vercel&logoColor=white)](https://grandprix81.vercel.app)

<br/>

*GrandPrix81 is a fan-made project. Not affiliated with Formula 1, FOM, or FIA.*

</div>
