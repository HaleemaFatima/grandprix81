import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrandPrix81 — F1 Strategy Simulator",
  description: "AI-powered Formula 1 race strategy engine. Optimise pit windows, tyre selection, and race pace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-f1dark text-f1white antialiased">
        {children}
      </body>
    </html>
  );
}