import passages from "@/data/level-up/typing-passages.json";
import { dailyIndex } from "@/lib/level-up/catalog";
import { estimateWpmFromChars } from "@/lib/level-up/wpm";

/** Content complexity for practice filters. Blind is a UI mode, not a content tier. */
export type TypingContentDifficulty = "easy" | "medium" | "hard";

/**
 * Practice tier control (Monkeytype-style row).
 * Blind = medium job-register content + no live correct/incorrect highlighting.
 */
export type TypingPracticeTier = "easy" | "medium" | "hard" | "blind";

export type TypingPassage = {
  id: string;
  category: string;
  title: string;
  text: string;
  difficulty: TypingContentDifficulty;
  /** Competency exam draw pool — must stay length/complexity comparable. */
  examStandard?: boolean;
};

/**
 * Practice duration:
 * - 60 = 1 min
 * - 120 = 2 min benchmark
 * - 0 = full passage (untimed finish)
 * - other positive = custom seconds
 */
export type TypingDurationSec = number;

const ALL = passages as TypingPassage[];

export function allTypingPassages(): TypingPassage[] {
  return ALL;
}

/** Exam-only pool: standardized short/medium bank (excludes hard/pro practice passages). */
export function examStandardTypingPassages(): TypingPassage[] {
  const marked = ALL.filter((p) => p.examStandard === true);
  if (marked.length > 0) return marked;
  // Fallback if older JSON lacks the flag
  return ALL.filter((p) => p.difficulty !== "hard");
}

export function contentDifficultyForTier(tier: TypingPracticeTier): TypingContentDifficulty {
  if (tier === "blind") return "medium";
  return tier;
}

export function filterTypingPassages(opts?: {
  difficulty?: TypingContentDifficulty;
  category?: string;
  examStandardOnly?: boolean;
}): TypingPassage[] {
  let pool = opts?.examStandardOnly ? examStandardTypingPassages() : ALL;
  if (opts?.difficulty) pool = pool.filter((p) => p.difficulty === opts.difficulty);
  if (opts?.category && opts.category !== "all") {
    pool = pool.filter((p) => p.category === opts.category);
  }
  return pool;
}

export function typingPassageOfDay(date = new Date()): TypingPassage {
  const pool = examStandardTypingPassages();
  const i = dailyIndex("typing", pool.length, date);
  return pool[i] ?? ALL[0]!;
}

export function randomTypingPassage(
  excludeId?: string,
  opts?: { difficulty?: TypingContentDifficulty; category?: string },
): TypingPassage {
  let pool = filterTypingPassages({
    difficulty: opts?.difficulty,
    category: opts?.category,
  });
  if (excludeId) pool = pool.filter((p) => p.id !== excludeId);
  if (pool.length === 0) {
    pool = filterTypingPassages({ difficulty: opts?.difficulty });
  }
  if (pool.length === 0) pool = [...ALL];
  return pool[Math.floor(Math.random() * pool.length)] ?? ALL[0]!;
}

export function passagesByCategory(category: string): TypingPassage[] {
  return ALL.filter((p) => p.category === category);
}

/** Normalize for fair compare: collapse whitespace runs except newlines preserved as single space. */
export function normalizeTypingText(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export type TypingScore = {
  /** Reliable WPM only; 0 when timing is too short / implausible (paste, etc.). */
  wpm: number;
  wpmReliable: boolean;
  /** Uncapped estimate before sanity gate (diagnostics / regression tests). */
  rawWpm: number;
  wpmNote?: string;
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
  const est = estimateWpmFromChars(correctChars, elapsedSec);
  const accuracy = typedChars === 0 ? 0 : Math.round((100 * correctChars) / typedChars);
  return {
    wpm: est.wpm,
    wpmReliable: est.reliable,
    rawWpm: est.rawWpm,
    wpmNote: est.reliable
      ? undefined
      : "Unable to estimate — timing too short or pace implausible (often paste / accidental finish).",
    accuracy,
    correctChars,
    typedChars,
    targetChars,
    elapsedSec: Math.round(Math.max(0, elapsedSec) * 10) / 10,
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
  if (!score.wpmReliable || score.wpm <= 0) return;
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

export const PRACTICE_DURATION_PRESETS = [
  { id: "60" as const, seconds: 60, label: "1 min" },
  { id: "120" as const, seconds: 120, label: "2 min", badge: "benchmark" },
  { id: "custom" as const, seconds: null, label: "custom" },
  { id: "full" as const, seconds: 0, label: "full text" },
] as const;

export const PRACTICE_TIER_OPTIONS: Array<{
  id: TypingPracticeTier;
  label: string;
  hint: string;
}> = [
  { id: "easy", label: "easy", hint: "Short, simple sentences" },
  { id: "medium", label: "medium", hint: "Job-register workplace lines" },
  { id: "hard", label: "hard", hint: "Longer · punctuation · pro pace" },
  { id: "blind", label: "blind", hint: "No live correct/incorrect feedback" },
];
