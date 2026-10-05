import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/gemini";
import { parseDemo, downloadDemo } from "@/lib/demo-parser";
import { mockAnalysis } from "@/lib/mock-data";
import type { AnalysisResult, PlayerStats } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 120; // парсинг больших демок может занять время

/**
 * POST /api/analyze
 * Принимает:
 * - multipart: поле "demo" (File .dem / .zst) и/или "url"
 * - опционально: focusPlayer (имя игрока)
 *
 * 1. Скачивает / читает файл
 * 2. Распаковывает .zst если нужно
 * 3. Парсит cs2parser
 * 4. Отправляет статы в Gemini
 * 5. Возвращает AnalysisResult
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let raw: Uint8Array | null = null;
    let filename = "demo.dem";
    let focusPlayer: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("demo") as File | null;
      const url = (formData.get("url") as string) || null;
      focusPlayer = (formData.get("focusPlayer") as string) || undefined;

      if (!file && !url) {
        return NextResponse.json(
          { error: "Нужен файл .dem / .zst или ссылка на демку" },
          { status: 400 }
        );
      }

      if (file) {
        filename = file.name || "demo.dem";
        const ab = await file.arrayBuffer();
        raw = new Uint8Array(ab);
        console.log("Uploaded:", filename, raw.length, "bytes");
      } else if (url) {
        console.log("Downloading:", url);
        const dl = await downloadDemo(url);
        raw = dl.data;
        filename = dl.filename;
        console.log("Downloaded:", filename, raw.length, "bytes");
      }
    } else {
      // JSON body с url
      try {
        const body = await req.json();
        if (body.url) {
          const dl = await downloadDemo(body.url);
          raw = dl.data;
          filename = dl.filename;
          focusPlayer = body.focusPlayer;
        }
      } catch {
        // ignore
      }
    }

    if (!raw || raw.length < 100) {
      return NextResponse.json(
        { error: "Файл пустой или слишком маленький" },
        { status: 400 }
      );
    }

    // --- Парсинг ---
    let parsed;
    try {
      parsed = await parseDemo(raw, filename, {
        focusPlayerName: focusPlayer,
      });
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
      return NextResponse.json(
        {
          error:
            parseErr instanceof Error
              ? parseErr.message
              : "Ошибка парсинга демки",
        },
        { status: 422 }
      );
    }

    // --- Gemini ---
    const aiPart = await analyzeWithGemini({
      map: parsed.map,
      score: parsed.score,
      playerStats: parsed.playerStats,
      keyEvents: parsed.keyEvents,
      elo: parsed.elo,
    });

    const analysisId = `demo-${Date.now().toString(36)}`;

    // Собираем PlayerStats для UI
    const focus = parsed.players.find(
      (p) => p.name === parsed.focusPlayerName
    );
    const player: PlayerStats = {
      name: focus?.name || "Player",
      kills: focus?.kills ?? 0,
      deaths: focus?.deaths ?? 0,
      assists: focus?.assists ?? 0,
      adr: 0, // cs2parser не даёт ADR из коробки без damage events — можно добавить позже
      hsPercent: 0,
      kd:
        focus && focus.deaths > 0
          ? +(focus.kills / focus.deaths).toFixed(2)
          : focus?.kills ?? 0,
      openingDuelsWon: 0,
      openingDuelsTotal: 0,
      utilityDamage: 0,
      clutchWins: 0,
      clutchAttempts: 0,
    };

    // Попробуем вытащить HS% из keyEvents
    const hsMatch = parsed.keyEvents
      .find((e) => e.startsWith("Headshot %:"))
      ?.match(/(\d+)%/);
    if (hsMatch) player.hsPercent = parseInt(hsMatch[1], 10);

    const durationMin = Math.floor(parsed.durationSeconds / 60);
    const durationSec = parsed.durationSeconds % 60;

    const result: AnalysisResult = {
      id: analysisId,
      map: parsed.map,
      date: new Date().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      duration: `${durationMin}:${String(durationSec).padStart(2, "0")}`,
      score: parsed.score,
      player,
      rounds: [], // можно заполнить из parsed позже
      topMistakes: aiPart.topMistakes,
      coachingReport: aiPart.coachingReport,
      trainingPlan: aiPart.trainingPlan,
      eloEstimate: parsed.elo,
    };

    return NextResponse.json({
      success: true,
      analysisId,
      analysis: result,
      parsedMeta: {
        map: parsed.map,
        score: parsed.score,
        players: parsed.players.map((p) => p.name),
        focusPlayer: parsed.focusPlayerName,
        eventsCount: parsed.keyEvents.length,
      },
      message: `Демка «${filename}» распарсена и разобрана Gemini`,
    });
  } catch (error) {
    console.error("Analyze error:", error);

    const message =
      error instanceof Error ? error.message : "Ошибка сервера";

    if (message.includes("GOOGLE_GENERATIVE_AI_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "Не задан GOOGLE_GENERATIVE_AI_API_KEY. Создай .env.local и добавь ключ из Google AI Studio.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
