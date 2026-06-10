"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-f1border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-f1red flex items-center justify-center glow-red group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-[10px] tracking-tighter">GP</span>
          </div>
          <span className="font-black text-white text-sm tracking-wider uppercase">
            GrandPrix<span className="text-f1red">81</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-f1muted">
          <Link href="/"
            className={`nav-item transition-colors hover:text-white ${path === "/" ? "text-white" : ""}`}>
            Home
          </Link>
          <Link href="/simulator"
            className={`nav-item transition-colors hover:text-white ${path === "/simulator" ? "text-white" : ""}`}>
            Simulator
          </Link>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 text-[11px] text-f1muted font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-f1red pulse-dot" />
          Engine Ready
        </div>
      </div>
      {/* Red line */}
      <div className="h-[2px] bg-f1red" />
    </nav>
  );
}