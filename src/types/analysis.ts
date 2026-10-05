export interface PlayerStats {
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  hsPercent: number;
  kd: number;
  openingDuelsWon: number;
  openingDuelsTotal: number;
  utilityDamage: number;
  clutchWins: number;
  clutchAttempts: number;
}

export interface RoundSummary {
  round: number;
  result: "win" | "loss";
  side: "CT" | "T";
  kills: number;
  deaths: number;
  keyMoments: string[];
}

export interface AIAdvice {
  title: string;
  description: string;
  round?: number;
  timestamp?: string;
  priority: "high" | "medium" | "low";
  category: "positioning" | "timing" | "utility" | "aim" | "decision";
}

export interface AnalysisResult {
  id: string;
  map: string;
  date: string;
  duration: string;
  score: string;
  player: PlayerStats;
  rounds: RoundSummary[];
  topMistakes: AIAdvice[];
  coachingReport: string;
  trainingPlan: string[];
  eloEstimate?: number;
}
