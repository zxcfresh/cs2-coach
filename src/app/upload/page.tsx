"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Link as LinkIcon,
  File,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".dem") || dropped.name.endsWith(".zst"))) {
      setFile(dropped);
      setLink("");
      setError(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setLink("");
      setError(null);
    }
  };

  const startAnalysis = async () => {
    if (!file && !link) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setStatus("Загружаем демку...");

    // Визуальные этапы (пока парсера нет — параллельно идёт запрос к Gemini)
    const stages = [
      { p: 15, s: "Загружаем файл..." },
      { p: 35, s: "Парсим демо..." },
      { p: 55, s: "Извлекаем статистику и позиции..." },
      { p: 75, s: "Сравниваем с твоим уровнем..." },
      { p: 90, s: "ИИ анализирует твою игру..." },
    ];

    let stageIndex = 0;
    const progressTimer = setInterval(() => {
      if (stageIndex < stages.length) {
        setProgress(stages[stageIndex].p);
        setStatus(stages[stageIndex].s);
        stageIndex++;
      }
    }, 800);

    try {
      const formData = new FormData();
      if (file) formData.append("demo", file);
      if (link) formData.append("url", link);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      clearInterval(progressTimer);

      if (!res.ok) {
        throw new Error(data.error || "Ошибка анализа");
      }

      setProgress(100);
      setStatus("Готово!");

      // Сохраняем результат в sessionStorage (пока нет БД)
      const analysis = data.analysis as AnalysisResult;
      sessionStorage.setItem(
        `analysis:${data.analysisId}`,
        JSON.stringify(analysis)
      );

      // Небольшая пауза, чтобы пользователь увидел 100%
      await new Promise((r) => setTimeout(r, 400));
      router.push(`/results/${data.analysisId}`);
    } catch (err) {
      clearInterval(progressTimer);
      setIsUploading(false);
      setProgress(0);
      setStatus("");
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)]">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="glow-orb w-[400px] h-[400px] bg-cs2-orange/8 top-20 right-0" />

      <div className="relative max-w-2xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-cs2-muted mb-5">
            <Sparkles className="w-3 h-3 text-cs2-orange" />
            Осталось 3 бесплатных анализа
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Загрузи демку
          </h1>
          <p className="text-cs2-muted text-sm md:text-base">
            Поддерживаются .dem, .dem.zst / .zst и ссылки Faceit / HLTV
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center transition-all duration-200 ${
            isDragging
              ? "border-cs2-orange bg-cs2-orange/5 scale-[1.01]"
              : file
              ? "border-cs2-green/40 bg-cs2-green/5"
              : "border-cs2-border/80 bg-cs2-card/40 hover:border-cs2-orange/40 hover:bg-cs2-card/60"
          }`}
        >
          <input
            type="file"
            accept=".dem,.zst,application/octet-stream"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cs2-green/10 border border-cs2-green/20 flex items-center justify-center">
                <File className="w-6 h-6 text-cs2-green" />
              </div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-cs2-zinc">
                {(file.size / 1024 / 1024).toFixed(1)} МБ
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFile(null);
                }}
                className="flex items-center gap-1 text-xs text-cs2-red hover:text-red-400 transition mt-1"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
                Удалить
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cs2-card border border-cs2-border flex items-center justify-center">
                <Upload className="w-6 h-6 text-cs2-muted" />
              </div>
              <p className="font-medium text-sm">Перетащи .dem или .zst сюда</p>
              <p className="text-xs text-cs2-zinc">или нажми, чтобы выбрать</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-cs2-border/60" />
          <span className="text-xs text-cs2-zinc">или</span>
          <div className="flex-1 h-px bg-cs2-border/60" />
        </div>

        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cs2-zinc" />
          <input
            type="url"
            placeholder="Ссылка на демку (Faceit, HLTV...)"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              if (e.target.value) setFile(null);
              setError(null);
            }}
            disabled={isUploading}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-cs2-card/60 border border-cs2-border/80 text-sm placeholder:text-cs2-zinc focus:outline-none focus:border-cs2-orange/50 transition"
          />
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-cs2-red/10 border border-cs2-red/20 text-sm text-cs2-red">
            {error}
          </div>
        )}

        {isUploading && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cs2-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cs2-orange" />
                {status}
              </span>
              <span className="font-mono text-cs2-orange">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-cs2-border/60 overflow-hidden">
              <div
                className="h-full bg-cs2-orange rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-cs2-zinc text-center">
              Парсим демку и Gemini анализирует... 10–40 сек
            </p>
          </div>
        )}

        <button
          onClick={startAnalysis}
          disabled={(!file && !link) || isUploading}
          className="mt-8 w-full py-4 rounded-xl bg-cs2-orange text-black font-semibold text-base hover:bg-cs2-orange-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-orange flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Анализируем...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Начать анализ
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-cs2-zinc">
          Парсер поддерживает .dem и .zst (Faceit/HLTV).<br />После парсинга Gemini делает разбор на реальных данных.
        </p>
      </div>
    </div>
  );
}
