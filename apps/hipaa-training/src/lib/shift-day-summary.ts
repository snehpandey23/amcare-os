import { countPresenceSessions, type PresenceLogEntry } from "@/lib/shift-presence";
import { loadLevelUpProgress, getDisplayStreak } from "@/lib/level-up/progress";
import { countQuestionsSince } from "@/lib/siya-os/metrics";
import { loadTodayReflection } from "@/lib/my-day";

export type ShiftDaySummary = {
  worked: boolean;
  breaks: number;
  focusSessions: number;
  learningCompleted: number;
  questionsAsked: number;
  reflectionSaved: boolean;
  todayLearnedPreview: string | null;
  streakDays: number;
};

export function buildShiftDaySummary(opts: {
  shiftStartedAt: string | undefined;
  presenceLog?: PresenceLogEntry[];
}): ShiftDaySummary {
  const { breaks, focusSessions } = countPresenceSessions(opts.presenceLog);
  const progress = loadLevelUpProgress();
  const startedMs = opts.shiftStartedAt ? new Date(opts.shiftStartedAt).getTime() : 0;
  return {
    worked: Boolean(opts.shiftStartedAt),
    breaks,
    focusSessions,
    learningCompleted: progress.completedToday?.length ?? 0,
    questionsAsked: startedMs ? countQuestionsSince(startedMs) : 0,
    reflectionSaved: Boolean(loadTodayReflection()?.trim()),
    todayLearnedPreview: null,
    streakDays: getDisplayStreak(progress),
  };
}
