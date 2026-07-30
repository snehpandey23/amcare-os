import { scheduleLevelUpRemoteSave } from "@/lib/level-up/progress-api";

const KEY = "siya-level-up-v1";

export type DailyCompletion =
  | "english"
  | "trivia"
  | "healthterm"
  | "compliance"
  | "documentation"
  | "map"
  | "timezone"
  | "typing"
  | "billing";

export type LevelUpProgress = {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD UTC
  completedToday: DailyCompletion[];
  totalXp: number;
  /** Cumulative drill completions (for admin reporting). */
  lifetimeDrills?: Partial<Record<DailyCompletion, number>>;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultProgress(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0 };
}

export function loadLevelUpProgress(): LevelUpProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as LevelUpProgress;
  } catch {
    return defaultProgress();
  }
}

export function saveLevelUpProgress(p: LevelUpProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  scheduleLevelUpRemoteSave(p);
}

export function markDailyComplete(item: DailyCompletion): LevelUpProgress {
  const today = todayUtc();
  let p = loadLevelUpProgress();
  if (p.lastActiveDate !== today) {
    const continued = p.lastActiveDate === yesterdayUtc();
    p = {
      ...p,
      streak: continued ? Math.max(1, p.streak + 1) : 1,
      lastActiveDate: today,
      completedToday: [],
    };
  }
  if (!p.completedToday.includes(item)) {
    p.completedToday = [...p.completedToday, item];
    p.totalXp += 10;
    const prev = p.lifetimeDrills?.[item] ?? 0;
    p.lifetimeDrills = { ...p.lifetimeDrills, [item]: prev + 1 };
  }
  saveLevelUpProgress(p);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("siya-level-up-updated"));
  }
  return p;
}

/** Streak shown in UI — broken if user skipped a calendar day. */
export function getDisplayStreak(p: LevelUpProgress): number {
  const today = todayUtc();
  if (p.lastActiveDate === today || p.lastActiveDate === yesterdayUtc()) return p.streak;
  return 0;
}
