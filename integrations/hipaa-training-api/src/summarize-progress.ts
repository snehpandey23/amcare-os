/** Summaries for admin team roster (mirrors apps/hipaa-training progress shapes). */

export type DrillKey =
  | "english"
  | "trivia"
  | "healthterm"
  | "compliance"
  | "documentation"
  | "map"
  | "timezone"
  | "typing"
  | "billing"
  | "patientChat";

export function summarizeTrainingProgress(progress: Record<string, unknown> | null | undefined) {
  if (!progress || typeof progress !== "object") {
    return {
      workforceRole: "other" as string,
      learnerName: null as string | null,
      modulesCompleted: 0,
      finalExamReady: false,
      secondsInCourse: 0,
      updatedAt: null as string | null,
    };
  }
  const modules = Array.isArray(progress.modulesCompleted) ? progress.modulesCompleted.length : 0;
  const final = progress.finalExam as { readiness?: string } | undefined;
  return {
    workforceRole: typeof progress.role === "string" ? progress.role : "other",
    learnerName: typeof progress.learnerName === "string" ? progress.learnerName : null,
    modulesCompleted: modules,
    finalExamReady: final?.readiness === "ready",
    secondsInCourse: typeof progress.secondsInCourse === "number" ? progress.secondsInCourse : 0,
    updatedAt: typeof progress.updatedAt === "number" ? new Date(progress.updatedAt).toISOString() : null,
  };
}

export function countChatSimRedFlags(dayLedger: unknown[]): number {
  let n = 0;
  for (const row of dayLedger) {
    if (!row || typeof row !== "object") continue;
    const e = row as { drill?: string; chatSim?: { redFlagged?: boolean } };
    if (e.drill === "patientChat" && e.chatSim?.redFlagged === true) n += 1;
  }
  return n;
}

export function summarizeLevelUpProgress(levelUp: Record<string, unknown> | null | undefined) {
  if (!levelUp || typeof levelUp !== "object") {
    return {
      totalXp: 0,
      streak: 0,
      lastActiveDate: "",
      lifetimeDrills: {} as Partial<Record<DrillKey, number>>,
      dayLedger: [] as unknown[],
      chatSimRedFlags: 0,
    };
  }
  const lifetime = (levelUp.lifetimeDrills as Partial<Record<DrillKey, number>>) || {};
  const dayLedger = Array.isArray(levelUp.dayLedger) ? levelUp.dayLedger : [];
  return {
    totalXp: typeof levelUp.totalXp === "number" ? levelUp.totalXp : 0,
    streak: typeof levelUp.streak === "number" ? levelUp.streak : 0,
    lastActiveDate: typeof levelUp.lastActiveDate === "string" ? levelUp.lastActiveDate : "",
    lifetimeDrills: lifetime,
    dayLedger,
    chatSimRedFlags: countChatSimRedFlags(dayLedger),
  };
}

export function drillCount(lifetime: Partial<Record<DrillKey, number>>, keys: DrillKey[]): number {
  return keys.reduce((n, k) => n + (lifetime[k] ?? 0), 0);
}
