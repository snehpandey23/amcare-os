import passages from "@/data/level-up/typing-passages.json";
import { dailyIndex } from "@/lib/level-up/catalog";

export type TypingPassage = {
  id: string;
  category: string;
  title: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
};

export type TypingDurationSec = 60 | 120 | 0;

const ALL = passages as TypingPassage[];

export function typingPassageOfDay(date = new Date()): TypingPassage {
  const i = dailyIndex("typing", ALL.length, date);
  return ALL[i];
}

export function randomTypingPassage(excludeId?: string): TypingPassage {
  const pool = excludeId ? ALL.filter((p) => p.id !== excludeId) : ALL;
  return pool[Math.floor(Math.random() * pool.length)] ?? ALL[0];
}

export function passagesByCategory(category: string): TypingPassage[] {
  return ALL.filter((p) => p.category === category);
}

/** Normalize for fair compare: collapse whitespace runs except newlines preserved as single space. */
export function normalizeTypingText(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export type TypingScore = {
  wpm: number;
  accuracy: number;
  correctChars: number;
  typedChars: number;
  targetChars: number;
  elapsedSec: number;
  finished: boolean;
};

export function scoreTyping(targetRaw: string, typedRaw: string, elapsedSec: number, finished: boolean): TypingScore {
  const target = normalizeTypingText(targetRaw);
  const typed = typedRaw.replace(/\r\n/g, "\n");
  const targetChars = target.length;
  let correctChars = 0;
  const compareLen = Math.max(target.length, typed.length);
  for (let i = 0; i < compareLen; i++) {
    const t = target[i] ?? "";
    const k = typed[i] ?? "";
    if (k && t === k) correctChars += 1;
  }
  const typedChars = typed.length;
  const minutes = Math.max(elapsedSec / 60, 1 / 60);
  const wpm = Math.round(correctChars / 5 / minutes);
  const accuracy = typedChars === 0 ? 0 : Math.round((100 * correctChars) / typedChars);
  return {
    wpm,
    accuracy,
    correctChars,
    typedChars,
    targetChars,
    elapsedSec: Math.round(elapsedSec * 10) / 10,
    finished,
  };
}

const STATS_KEY = "siya-typing-stats-v1";

export type TypingBest = { wpm: number; accuracy: number; passageId: string; at: number };

export function loadTypingBest(): TypingBest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TypingBest;
  } catch {
    return null;
  }
}

export function saveTypingBestIfBetter(score: TypingScore, passageId: string) {
  if (typeof window === "undefined") return;
  const prev = loadTypingBest();
  if (prev && prev.wpm >= score.wpm) return;
  const next: TypingBest = {
    wpm: score.wpm,
    accuracy: score.accuracy,
    passageId,
    at: Date.now(),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
}

export const TYPING_CATEGORIES = [
  { id: "documentation", label: "Documentation" },
  { id: "call", label: "Call scripts" },
  { id: "chat", label: "Chat / messages" },
  { id: "email", label: "Email" },
  { id: "english", label: "Workplace English" },
] as const;
