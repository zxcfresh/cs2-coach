import { AnalysisResult } from "@/types/analysis";

export const mockAnalysis: AnalysisResult = {
  id: "demo-123",
  map: "de_mirage",
  date: "5 октября 2026",
  duration: "42:18",
  score: "13:11",
  eloEstimate: 2150,
  player: {
    name: "Player",
    kills: 24,
    deaths: 18,
    assists: 7,
    adr: 89.4,
    hsPercent: 52,
    kd: 1.33,
    openingDuelsWon: 6,
    openingDuelsTotal: 11,
    utilityDamage: 187,
    clutchWins: 2,
    clutchAttempts: 4,
  },
  rounds: [
    {
      round: 3,
      result: "loss",
      side: "T",
      kills: 0,
      deaths: 1,
      keyMoments: ["Ранний выход на mid без информации"],
    },
    {
      round: 7,
      result: "loss",
      side: "T",
      kills: 1,
      deaths: 1,
      keyMoments: ["Слишком рано вышел из-за A-smoke"],
    },
    {
      round: 14,
      result: "win",
      side: "CT",
      kills: 3,
      deaths: 0,
      keyMoments: ["Отличный hold на B с правильным timing"],
    },
  ],
  topMistakes: [
    {
      title: "Ранний выход из-за смока",
      description:
        "В 7 раунде на тайминге 1:14 ты вышел из-за A-smoke раньше, чем команда заняла позиции. Противник успел среагировать. Лучше подождать 3–4 секунды.",
      round: 7,
      timestamp: "1:14",
      priority: "high",
      category: "timing",
    },
    {
      title: "Плохое позиционирование на mid",
      description:
        "В 3 раунде стоял слишком открыто на mid. Не использовал укрытие у window. Из-за этого получил opening death.",
      round: 3,
      timestamp: "0:42",
      priority: "high",
      category: "positioning",
    },
    {
      title: "Утилити без цели",
      description:
        "За матч 4 раза кинул flash/smoke, которые не дали преимущества команде. Особенно на B-апе в 11 раунде.",
      priority: "medium",
      category: "utility",
    },
    {
      title: "Ре-пик после первого килла",
      description:
        "Несколько раз после успешного килла сразу ре-пикал тот же угол. Противник уже ждал. Лучше менять позицию.",
      priority: "medium",
      category: "decision",
    },
  ],
  coachingReport: `Ты играешь на хорошем уровне (~2150 ELO). Сильные стороны: aim и clutch-ситуации (2/4). 

Главная проблема сейчас — **timing и позиционирование**. Ты часто принимаешь решения на секунду раньше, чем нужно. Это особенно заметно при выходах из-за смоков и на mid.

Также стоит поработать с utility: количество урона от гранат среднее, но эффективность (влияние на раунд) ниже ожидаемой для твоего ELO.

Если закроешь эти две дыры — спокойно пойдёшь к 2400+.`,
  trainingPlan: [
    "10 минут в день — deathmatch с фокусом на pre-aim углов",
    "Смотреть свои death-раунды и отмечать, где стоял открыто",
    "Тренировать timing выходов: ждать 2–3 секунды после смока",
    "Практика utility на Mirage (A-execute и mid control)",
    "Разбор 1 про-демки на Mirage в неделю (смотреть только свою роль)",
  ],
};
