import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1red:    "#E8002D",
        f1dark:   "#000000",
        f1panel:  "#0D0D0D",
        f1panel2: "#111111",
        f1border: "#1E1E1E",
        f1muted:  "#888888",
        f1white:  "#FFFFFF",
        f1yellow: "#FFD700",
        f1teal:   "#00D2BE",
        soft:     "#111111",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
    },
  },
  plugins: [],
};
export default config;