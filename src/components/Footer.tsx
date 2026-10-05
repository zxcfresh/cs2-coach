import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cs2-border/60 bg-cs2-darker">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cs2-orange to-orange-600 flex items-center justify-center font-bold text-black text-xs">
              AI
            </div>
            <span className="font-medium text-sm">CS2 AI Coach</span>
          </div>

          <div className="flex gap-6 text-sm text-cs2-muted">
            <Link href="/pricing" className="hover:text-white transition">
              Тарифы
            </Link>
            <a href="#" className="hover:text-white transition">
              Поддержка
            </a>
            <a href="#" className="hover:text-white transition">
              Telegram
            </a>
          </div>

          <p className="text-xs text-cs2-zinc">
            © 2026 CS2 AI Coach. Не аффилирован с Valve.
          </p>
        </div>
      </div>
    </footer>
  );
}
