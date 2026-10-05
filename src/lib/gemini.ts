import { CS2_COACH_SYSTEM_PROMPT, buildUserPrompt } from "./ai-prompt";
import type { AnalysisResult, AIAdvice } from "@/types/analysis";
import { mockAnalysis } from "./mock-data";

// Модель. "gemini-flash-latest" — рабочий алиас; можно заменить на
// "gemini-2.5-flash" или "gemini-2.5-flash-lite" при необходимости.
const MODEL = "gemini-flash-latest";

const RESPONSE_SCHEMA_INSTRUCTION = `
Верни ТОЛЬКО валидный JSON без markdown и без \`\`\`json.
Структура строго такая:

{
  "coachingReport": "строка — общий вердикт 2-5 предложений",
  "topMistakes": [
    {
      "title": "короткий заголовок ошибки",
      "description": "подробное объяснение: что сделал, почему плохо, как нужно было",
      "round": 7,
      "timestamp": "1:14",
      "priority": "high",
      "category": "timing"
    }
  ],
  "trainingPlan": [
    "конкретный пункт тренировки 1",
    "конкретный пункт 2",
    "..."
  ]
}

Правила:
- topMistakes: 3–5 штук
- priority только: "high" | "medium" | "low"
- category только: "positioning" | "timing" | "utility" | "aim" | "decision"
- round и timestamp — если можешь вывести из данных, иначе можно null
- Всё на русском языке
- Без воды, конкретно
`;

export type GeminiAnalysisInput = {
  map: string;
  score: string;
  playerStats: Record<string, unknown>;
  keyEvents: string[];
  elo?: number;
};

/** Читаем ключ/базовый URL на КАЖДЫЙ вызов — чтобы не перечитывать сервер при смене .env */
function getGeminiConfig() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  // Для официального API Google это https://generativelanguage.googleapis.com
  // Если ключ от прокси/шлюза — задай GEMINI_BASE_URL, например https://proxy.example.com
  const baseUrl =
    (process.env.GEMINI_BASE_URL || "").replace(/\/$/, "") ||
    "https://generativelanguage.googleapis.com";

  return { apiKey, baseUrl };
}

/**
 * Прямой вызов Gemini REST API через fetch.
 */
async function callGemini(userText: string): Promise<string> {
  const { apiKey, baseUrl } = getGeminiConfig();

  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY не задан. Добавь ключ в .env.local и перезапусти dev-сервер (npm run dev)."
    );
  }

  // Формат ключей Google менялся (раньше AIza..., сейчас встречаются и другие префиксы).
  // Жёстко не блокируем — только логируем подозрительный формат.
  if (!/^[A-Za-z0-9_\-.]{20,}$/.test(apiKey)) {
    console.warn(
      `[gemini] Ключ имеет нестандартный формат ("${apiKey.slice(0, 4)}..."). ` +
        `Если API вернёт 400 "API key not valid" — проверь, что ключ скопирован целиком, ` +
        `или задай GEMINI_BASE_URL, если это ключ от прокси-шлюза.`
    );
  }

  const apiUrl = `${baseUrl}/v1beta/models/${MODEL}:generateContent`;

  const body = {
    systemInstruction: {
      parts: [{ text: CS2_COACH_SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Сеть: не удалось достучаться до API (${msg}). ` +
        `Проверь интернет, VPN, антивирус и файрвол.`
    );
  }

  const raw = await res.text();
  let data: {
    error?: { message?: string; status?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`API вернул не JSON (HTTP ${res.status}): ${raw.slice(0, 200)}`);
  }

  if (!res.ok) {
    const m = data?.error?.message || raw.slice(0, 300);
    // Понятная подсказка при невалидном ключе
    if (res.status === 400 && /api key not valid|API_KEY_INVALID/i.test(m)) {
      throw new Error(
        `API вернул: ключ не валиден (HTTP 400). Получи новый ключ на https://aistudio.google.com/apikey ` +
          `и проверь, что в .env.local нет лишних пробелов/кавычек.`
      );
    }
    if (res.status === 429) {
      throw new Error(
        `Лимит запросов исчерпан (HTTP 429): ${m}. Подожди минуту или включи биллинг в Google AI Studio.`
      );
    }
    throw new Error(`Gemini HTTP ${res.status}: ${m}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(
      "Gemini вернул пустой ответ. Возможно, сработал safety-фильтр."
    );
  }

  return text;
}

export async function analyzeWithGemini(
  input?: Partial<GeminiAnalysisInput>
): Promise<
  Pick<AnalysisResult, "coachingReport" | "topMistakes" | "trainingPlan">
> {
  const stats: GeminiAnalysisInput = {
    map: input?.map ?? mockAnalysis.map,
    score: input?.score ?? mockAnalysis.score,
    playerStats:
      input?.playerStats ??
      (mockAnalysis.player as unknown as Record<string, unknown>),
    keyEvents:
      input?.keyEvents ??
      mockAnalysis.rounds.flatMap((r) =>
        r.keyMoments.map((m) => `Раунд ${r.round} (${r.side}): ${m}`)
      ),
    elo: input?.elo ?? mockAnalysis.eloEstimate,
  };

  const userPrompt =
    buildUserPrompt(stats) + "\n\n" + RESPONSE_SCHEMA_INSTRUCTION;

  const text = await callGemini(userPrompt);

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: {
    coachingReport: string;
    topMistakes: AIAdvice[];
    trainingPlan: string[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Gemini вернул невалидный JSON:", text);
    return {
      coachingReport: text.slice(0, 1500) || mockAnalysis.coachingReport,
      topMistakes: mockAnalysis.topMistakes,
      trainingPlan: mockAnalysis.trainingPlan,
    };
  }

  if (!parsed.coachingReport || !Array.isArray(parsed.topMistakes)) {
    throw new Error("Gemini вернул неполную структуру");
  }

  return {
    coachingReport: parsed.coachingReport,
    topMistakes: parsed.topMistakes.map((m) => ({
      title: m.title || "Ошибка",
      description: m.description || "",
      round: m.round,
      timestamp: m.timestamp,
      priority: (["high", "medium", "low"].includes(m.priority)
        ? m.priority
        : "medium") as AIAdvice["priority"],
      category: ([
        "positioning",
        "timing",
        "utility",
        "aim",
        "decision",
      ].includes(m.category)
        ? m.category
        : "decision") as AIAdvice["category"],
    })),
    trainingPlan: Array.isArray(parsed.trainingPlan)
      ? parsed.trainingPlan.slice(0, 8)
      : mockAnalysis.trainingPlan,
  };
}
