"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-cs2-border/60 bg-cs2-darker/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cs2-orange to-orange-600 flex items-center justify-center font-bold text-black text-sm shadow-glow-sm group-hover:shadow-glow-orange transition-shadow">
            AI
          </div>
          <span className="font-semibold text-lg tracking-tight group-hover:text-cs2-orange transition-colors">
            CS2 AI Coach
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/upload"
            className="px-4 py-2 rounded-lg text-sm text-cs2-muted hover:text-white hover:bg-white/5 transition"
          >
            Анализ
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg text-sm text-cs2-muted hover:text-white hover:bg-white/5 transition"
          >
            Тарифы
          </Link>
          <Link
            href="/upload"
            className="ml-3 px-5 py-2 rounded-lg bg-cs2-orange text-black text-sm font-semibold hover:bg-cs2-orange-light transition shadow-glow-sm hover:shadow-glow-orange"
          >
            Попробовать бесплатно
          </Link>
        </nav>

        {/* Mobile button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cs2-border/60 bg-cs2-darker/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <Link
            href="/upload"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm text-cs2-muted hover:text-white hover:bg-white/5 transition"
          >
            Анализ
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm text-cs2-muted hover:text-white hover:bg-white/5 transition"
          >
            Тарифы
          </Link>
          <Link
            href="/upload"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-lg bg-cs2-orange text-black text-sm font-semibold text-center"
          >
            Попробовать бесплатно
          </Link>
        </div>
      )}
    </header>
  );
}
