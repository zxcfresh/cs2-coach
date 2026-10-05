"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mockAnalysis } from "@/lib/mock-data";
import type { AnalysisResult } from "@/types/analysis";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Сначала пробуем sessionStorage (куда upload кладёт результат Gemini)
    try {
      const raw = sessionStorage.getItem(`analysis:${id}`);
      if (raw) {
        setData(JSON.parse(raw) as AnalysisResult);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    // Фоллбек на mock (например, если открыли /results/demo-123 напрямую)
    setData({ ...mockAnalysis, id });
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cs2-orange" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-cs2-muted mb-4">Анализ не найден</p>
        <Link href="/upload" className="text-cs2-orange hover:underline">
          Загрузить демку
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />

      <div className="relative max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 text-xs text-cs2-zinc hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Новый анализ
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-cs2-zinc mb-1 font-mono">
              #{id} · {data.date}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {data.map}{" "}
              <span className="text-cs2-muted font-medium">{data.score}</span>
            </h1>
            <p className="text-sm text-cs2-muted mt-1">
              {data.duration} · ELO ~{data.eloEstimate}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cs2-border/80 bg-cs2-card/50 hover:bg-cs2-card text-xs font-medium transition self-start sm:self-auto">
            <Download className="w-3.5 h-3.5" />
            Скачать PDF
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatCard label="K/D" value={data.player.kd.toFixed(2)} />
          <StatCard label="ADR" value={data.player.adr.toFixed(1)} />
          <StatCard label="HS %" value={`${data.player.hsPercent}%`} />
          <StatCard
            label="Opening"
            value={`${data.player.openingDuelsWon}/${data.player.openingDuelsTotal}`}
          />
        </div>

        <section className="mb-8 p-6 rounded-2xl bg-cs2-card/50 border border-cs2-border/60">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cs2-orange/10 border border-cs2-orange/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-cs2-orange" />
            </div>
            <h2 className="font-semibold">ИИ-разбор</h2>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cs2-orange/15 text-cs2-orange">
              Gemini
            </span>
          </div>
          <div className="text-sm text-cs2-muted leading-relaxed whitespace-pre-line">
            {data.coachingReport}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cs2-red/10 border border-cs2-red/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-cs2-red" />
            </div>
            <h2 className="font-semibold">Главные ошибки</h2>
          </div>

          <div className="space-y-3">
            {data.topMistakes.map((mistake, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-cs2-card/50 border border-cs2-border/60 hover:border-cs2-border transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-sm">{mistake.title}</h3>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      mistake.priority === "high"
                        ? "bg-cs2-red/15 text-cs2-red"
                        : mistake.priority === "medium"
                        ? "bg-cs2-orange/15 text-cs2-orange"
                        : "bg-cs2-zinc/20 text-cs2-zinc"
                    }`}
                  >
                    {mistake.priority === "high"
                      ? "Высокий"
                      : mistake.priority === "medium"
                      ? "Средний"
                      : "Низкий"}
                  </span>
                </div>
                <p className="text-xs text-cs2-muted leading-relaxed">
                  {mistake.description}
                </p>
                {mistake.round && (
                  <p className="mt-2.5 text-[11px] text-cs2-zinc font-mono">
                    Раунд {mistake.round}
                    {mistake.timestamp && ` · ${mistake.timestamp}`}
                    {" · "}
                    {mistake.category}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 p-6 rounded-2xl bg-cs2-card/50 border border-cs2-border/60">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cs2-green/10 border border-cs2-green/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-cs2-green" />
            </div>
            <h2 className="font-semibold">План тренировок</h2>
          </div>
          <ul className="space-y-2.5">
            {data.trainingPlan.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-cs2-orange font-mono text-xs mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-cs2-muted">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="text-center pt-6 border-t border-cs2-border/40">
          <p className="text-sm text-cs2-muted mb-4">
            Понравился разбор? Загрузи ещё или оформи Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/upload"
              className="px-6 py-3 rounded-xl bg-cs2-orange text-black text-sm font-semibold hover:bg-cs2-orange-light transition shadow-glow-sm"
            >
              Ещё один анализ
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl border border-cs2-border/80 text-sm hover:bg-cs2-card transition"
            >
              Перейти на Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-cs2-card/50 border border-cs2-border/60 text-center">
      <div className="text-xl md:text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-[11px] text-cs2-zinc mt-0.5 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
