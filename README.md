# CS2 AI Coach

Веб-сервис для анализа демо-файлов Counter-Strike 2 с помощью **Google Gemini**.

## Что умеет

- Загрузка **`.dem`** и **`.zst` / `.dem.zst`** (Faceit, HLTV)
- Скачивание демки по ссылке
- Парсинг через **cs2parser** (киллы, раунды, игроки, карта, счёт)
- Разбор ошибок и план тренировок от **Gemini**
- Тёмный UI в стиле CS2 / Faceit

## Стек

- Next.js 15 (App Router) + TypeScript + Tailwind
- `cs2parser` — парсинг демо
- `fzstd` — распаковка Zstandard
- `@google/generative-ai` — Gemini

## Запуск

```bash
cd cs2-ai-coach
npm install
```

Создай `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...ключ_из_Google_AI_Studio
```

Ключ: https://aistudio.google.com/apikey

```bash
npm run dev
```

Открой http://localhost:3000 → загрузи `.dem` или `.zst` → получи разбор.

## Как работает пайплайн

1. Пользователь загружает файл или вставляет URL
2. Если `.zst` — распаковываем (`fzstd`)
3. `cs2parser` читает события: deaths, rounds, players, map
4. Собираем keyEvents + статистику фокус-игрока
5. Gemini (system prompt коуча) возвращает JSON: вердикт, ошибки, план
6. Показываем на `/results/[id]`

## Структура

```
src/
  app/
    api/analyze/route.ts   — upload → parse → Gemini
    upload/                — UI загрузки
    results/[id]/         — результаты
  lib/
    demo-parser.ts         — .dem / .zst + cs2parser
    gemini.ts              — вызов Gemini
    ai-prompt.ts           — промпт коуча
    mock-data.ts           — fallback
```

## Ограничения сейчас

- ADR / utility damage / clutch — базово (можно расширить damage events)
- Нет БД — результат в sessionStorage
- Большие демки (>200 МБ) лучше грузить с хорошим интернетом / сервером

## Дальше

- Выбор игрока из списка (сейчас — топ по киллам)
- Damage events → ADR, utility
- Heatmap смертей
- Auth + история
- Очередь (BullMQ) для тяжёлых демок

## Лицензия

MIT
