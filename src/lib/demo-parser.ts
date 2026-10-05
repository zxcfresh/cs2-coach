/**
 * Парсер CS2 демки (.dem и .zst)
 * Использует cs2parser + fzstd для распаковки Zstandard
 */

import { decompress } from "fzstd";
import type { GeminiAnalysisInput } from "./gemini";

// Динамический импорт cs2parser (ESM, может быть тяжёлым)
async function getCs2Parser() {
  const mod = await import("cs2parser");
  return mod;
}

/** Magic bytes Zstandard: 0x28 0xB5 0x2F 0xFD */
function isZstd(buf: Uint8Array): boolean {
  return (
    buf.length >= 4 &&
    buf[0] === 0x28 &&
    buf[1] === 0xb5 &&
    buf[2] === 0x2f &&
    buf[3] === 0xfd
  );
}

/** Magic bytes CS2 demo (PBDEMS2) */
function isDem(buf: Uint8Array): boolean {
  // "PBDEMS2" в начале
  if (buf.length < 8) return false;
  const sig = String.fromCharCode(...buf.slice(0, 7));
  return sig === "PBDEMS2";
}

/**
 * Распаковывает .zst → сырой .dem buffer
 * Если уже .dem — возвращает как есть
 */
export function ensureDemBuffer(
  data: Uint8Array,
  filename?: string
): Uint8Array {
  const name = (filename || "").toLowerCase();

  if (isZstd(data) || name.endsWith(".zst") || name.endsWith(".dem.zst")) {
    try {
      const out = decompress(data);
      return out;
    } catch (e) {
      throw new Error(
        `Не удалось распаковать .zst: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  if (isDem(data) || name.endsWith(".dem")) {
    return data;
  }

  // Попробуем всё равно как zstd (на случай неправильного имени)
  if (isZstd(data)) {
    return decompress(data);
  }

  throw new Error(
    "Файл не похож на .dem или .zst. Загрузи демку CS2 (несжатую или в Zstandard)."
  );
}

export type ParsedDemoStats = GeminiAnalysisInput & {
  map: string;
  score: string;
  durationSeconds: number;
  players: Array<{
    name: string;
    steamId?: string;
    kills: number;
    deaths: number;
    assists: number;
    teamNumber: number;
  }>;
  /** Имя «главного» игрока (POV или с наибольшим числом киллов) */
  focusPlayerName?: string;
};

type KillEvent = {
  round: number;
  attacker: string;
  victim: string;
  weapon: string;
  headshot: boolean;
  tick: number;
};

type RoundInfo = {
  round: number;
  winner: number; // team number
  reason?: string;
};

/**
 * Парсит демку и возвращает структурированные данные для Gemini
 */
export async function parseDemo(
  raw: Uint8Array,
  filename?: string,
  options?: { focusSteamId?: string; focusPlayerName?: string }
): Promise<ParsedDemoStats> {
  const demBytes = ensureDemBuffer(raw, filename);

  const { DemoReader, EntityMode } = await getCs2Parser();

  const parser = new DemoReader();

  let mapName = "unknown";
  let tickInterval = 1 / 64;
  let currentRound = 0;
  const kills: KillEvent[] = [];
  const rounds: RoundInfo[] = [];
  let ctScore = 0;
  let tScore = 0;

  // Header / map
  parser.on("header", (header: { map_name?: string }) => {
    if (header?.map_name) mapName = header.map_name;
  });

  parser.on("serverinfo", (info: { tick_interval?: number; map_name?: string }) => {
    if (info?.tick_interval) tickInterval = info.tick_interval;
    if (info?.map_name) mapName = info.map_name;
  });

  // Kills
  parser.gameEvents.on(
    "player_death",
    (event: {
      attackerPlayer?: { name?: string } | null;
      player?: { name?: string } | null;
      weapon?: string;
      headshot?: boolean;
    }) => {
      const attacker = event.attackerPlayer?.name || "world";
      const victim = event.player?.name || "unknown";
      kills.push({
        round: currentRound || 1,
        attacker,
        victim,
        weapon: event.weapon || "unknown",
        headshot: !!event.headshot,
        tick: parser.currentTick ?? 0,
      });
    }
  );

  // Rounds
  parser.gameEvents.on("round_start", () => {
    currentRound += 1;
  });

  parser.gameEvents.on(
    "round_end",
    (event: { winner?: number; reason?: number | string }) => {
      const winner = event.winner ?? 0;
      rounds.push({
        round: currentRound,
        winner,
        reason: String(event.reason ?? ""),
      });
      // team 2 = T, team 3 = CT (стандарт Source)
      if (winner === 3) ctScore += 1;
      else if (winner === 2) tScore += 1;
    }
  );

  // Парсим из buffer
  const outcome = await parser.parseDemo(demBytes, {
    entities: EntityMode.ALL,
  });

  if (outcome?.status && outcome.status !== "complete") {
    console.warn("Demo parse status:", outcome.status);
  }

  // Игроки
  const players: ParsedDemoStats["players"] = [];
  const controllers = parser.playerControllers || [];

  for (const p of controllers) {
    const name = p.name || p.playerName || "Player";
    // Пропускаем ботов без имени / пустых
    if (!name || name === "unconnected") continue;

    players.push({
      name,
      steamId: p.steamId ? String(p.steamId) : undefined,
      kills: Number(p.kills ?? 0),
      deaths: Number(p.deaths ?? 0),
      assists: Number(p.assists ?? 0),
      teamNumber: Number(p.teamNumber ?? 0),
    });
  }

  // Если playerControllers пустые — fallback по kills
  if (players.length === 0 && kills.length > 0) {
    const mapKills = new Map<string, { k: number; d: number }>();
    for (const k of kills) {
      if (k.attacker !== "world") {
        const a = mapKills.get(k.attacker) || { k: 0, d: 0 };
        a.k += 1;
        mapKills.set(k.attacker, a);
      }
      const v = mapKills.get(k.victim) || { k: 0, d: 0 };
      v.d += 1;
      mapKills.set(k.victim, v);
    }
    for (const [name, st] of mapKills) {
      players.push({
        name,
        kills: st.k,
        deaths: st.d,
        assists: 0,
        teamNumber: 0,
      });
    }
  }

  // Выбираем фокус-игрока
  let focus = options?.focusPlayerName;
  if (options?.focusSteamId) {
    const bySteam = players.find((p) => p.steamId === options.focusSteamId);
    if (bySteam) focus = bySteam.name;
  }
  if (!focus && players.length > 0) {
    // Берём игрока с наибольшим числом киллов
    focus = [...players].sort((a, b) => b.kills - a.kills)[0].name;
  }

  const focusPlayer = players.find((p) => p.name === focus) || players[0];

  // Score
  // Иногда score из round_end неполный — берём max из rounds
  if (rounds.length > 0 && ctScore + tScore === 0) {
    // уже посчитали выше
  }
  const score =
    ctScore + tScore > 0
      ? `${Math.max(ctScore, tScore)}:${Math.min(ctScore, tScore)}`
      : rounds.length > 0
      ? `${rounds.length}`
      : "—";

  // Длительность
  const lastTick = parser.currentTick ?? 0;
  const durationSeconds = Math.round(lastTick * tickInterval);

  // Ключевые события для промпта
  const keyEvents: string[] = [];

  // Opening deaths (первые киллы раунда)
  const openingsByRound = new Map<number, KillEvent>();
  for (const k of kills) {
    if (!openingsByRound.has(k.round)) {
      openingsByRound.set(k.round, k);
    }
  }

  if (focusPlayer) {
    const myKills = kills.filter((k) => k.attacker === focusPlayer.name);
    const myDeaths = kills.filter((k) => k.victim === focusPlayer.name);

    keyEvents.push(
      `Игрок: ${focusPlayer.name} — ${focusPlayer.kills}K / ${focusPlayer.deaths}D / ${focusPlayer.assists}A`
    );

    // Смерти в начале раунда
    let earlyDeaths = 0;
    for (const [round, firstKill] of openingsByRound) {
      if (firstKill.victim === focusPlayer.name) {
        earlyDeaths++;
        if (keyEvents.length < 25) {
          keyEvents.push(
            `Раунд ${round}: opening death (убит ${firstKill.attacker} с ${firstKill.weapon}${firstKill.headshot ? ", HS" : ""})`
          );
        }
      }
    }
    if (earlyDeaths > 0) {
      keyEvents.push(`Всего opening deaths: ${earlyDeaths}`);
    }

    // Мульти-киллы
    const killsByRound = new Map<number, number>();
    for (const k of myKills) {
      killsByRound.set(k.round, (killsByRound.get(k.round) || 0) + 1);
    }
    for (const [round, cnt] of killsByRound) {
      if (cnt >= 3) {
        keyEvents.push(`Раунд ${round}: ${cnt} килла`);
      }
    }

    // HS%
    const hs = myKills.filter((k) => k.headshot).length;
    const hsPercent =
      myKills.length > 0 ? Math.round((hs / myKills.length) * 100) : 0;
    keyEvents.push(`Headshot %: ${hsPercent}% (${hs}/${myKills.length})`);

    // Оружие
    const weapons = new Map<string, number>();
    for (const k of myKills) {
      weapons.set(k.weapon, (weapons.get(k.weapon) || 0) + 1);
    }
    const topWeapons = [...weapons.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w, c]) => `${w}×${c}`)
      .join(", ");
    if (topWeapons) keyEvents.push(`Топ оружие: ${topWeapons}`);

    // Последние смерти (контекст)
    for (const d of myDeaths.slice(-5)) {
      keyEvents.push(
        `Раунд ${d.round}: смерть от ${d.attacker} (${d.weapon}${d.headshot ? ", HS" : ""})`
      );
    }
  }

  // Общая инфа
  keyEvents.unshift(
    `Карта: ${mapName}`,
    `Раундов: ${rounds.length || currentRound}`,
    `Счёт (прибл.): CT ${ctScore} — T ${tScore}`,
    `Длительность: ${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`
  );

  const playerStats: Record<string, unknown> = focusPlayer
    ? {
        name: focusPlayer.name,
        kills: focusPlayer.kills,
        deaths: focusPlayer.deaths,
        assists: focusPlayer.assists,
        kd:
          focusPlayer.deaths > 0
            ? +(focusPlayer.kills / focusPlayer.deaths).toFixed(2)
            : focusPlayer.kills,
        team: focusPlayer.teamNumber === 3 ? "CT" : focusPlayer.teamNumber === 2 ? "T" : "?",
      }
    : {};

  // Добавляем всех игроков кратко
  playerStats.allPlayers = players.map(
    (p) => `${p.name}: ${p.kills}/${p.deaths}/${p.assists}`
  );

  return {
    map: mapName,
    score: `${ctScore}:${tScore}`,
    durationSeconds,
    players,
    focusPlayerName: focusPlayer?.name,
    playerStats,
    keyEvents,
    elo: undefined,
  };
}

/**
 * Скачивает демку по URL (Faceit/HLTV часто отдают .dem.zst)
 */
export async function downloadDemo(url: string): Promise<{
  data: Uint8Array;
  filename: string;
}> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "CS2-AI-Coach/1.0",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Не удалось скачать демку: HTTP ${res.status}`);
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  let filename = match?.[1]?.replace(/['"]/g, "") || "";

  if (!filename) {
    try {
      const u = new URL(url);
      filename = u.pathname.split("/").pop() || "demo.dem";
    } catch {
      filename = "demo.dem";
    }
  }

  return { data: buf, filename };
}
