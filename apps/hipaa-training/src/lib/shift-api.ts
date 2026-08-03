import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type ShiftMood = "great" | "okay" | "difficult";

export type PresenceStatus = "working" | "break" | "focus";

export type ActiveShift = {
  startedAt: string;
  workShift: "morning" | "evening" | "night";
  presence: PresenceStatus;
  presenceSince: string;
  presenceLog?: { status: PresenceStatus | "available"; at: string }[];
};

export type ShiftRecord = {
  id: string;
  startedAt: string;
  endedAt: string;
  workShift: "morning" | "evening" | "night";
  endMood?: ShiftMood;
  endReflection?: string;
  todayLearned?: string;
};

export type ShiftState = {
  active: ActiveShift | null;
  recent: ShiftRecord[];
  shiftEndEventId?: string;
};

async function shiftFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchShiftState(): Promise<ShiftState> {
  const data = (await shiftFetch("/api/shift/state")) as ShiftState;
  return { active: data.active ?? null, recent: data.recent ?? [] };
}

export async function ensureActiveShift(workShift: "morning" | "evening" | "night" = "morning"): Promise<ShiftState> {
  return (await shiftFetch("/api/shift/ensure-active", {
    method: "POST",
    body: JSON.stringify({ workShift }),
  })) as ShiftState;
}

export async function startShift(workShift: "morning" | "evening" | "night"): Promise<ShiftState> {
  return (await shiftFetch("/api/shift/start", {
    method: "POST",
    body: JSON.stringify({ workShift }),
  })) as ShiftState;
}

export async function endShift(payload: {
  mood?: ShiftMood;
  reflection?: string;
  todayLearned?: string;
  accomplishments?: string;
  memoryImportance?: import("@/lib/memory-api").MemoryImportance;
}): Promise<ShiftState> {
  const data = (await shiftFetch("/api/shift/end", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as ShiftState;
  return { active: data.active ?? null, recent: data.recent ?? [], shiftEndEventId: data.shiftEndEventId };
}

export async function setShiftPresence(status: PresenceStatus): Promise<ShiftState> {
  return (await shiftFetch("/api/shift/presence", {
    method: "POST",
    body: JSON.stringify({ status }),
  })) as ShiftState;
}

export type TeamShiftMember = {
  id: string;
  email: string;
  name: string | null;
  portalRole: string;
  shiftStartedAt: string | null;
  shiftEndedAt: string | null;
  onShift: boolean;
  presence: PresenceStatus | null;
  endMood: ShiftMood | null;
  todayLearned: string | null;
};

export type ShiftDashboard = {
  date: string;
  timezone: string;
  generatedAt: string;
  live: {
    expected: number;
    onShift: number;
    working: number;
    onBreak: number;
    inFocus: number;
    offShift: number;
    members: {
      id: string;
      email: string;
      name: string | null;
      onShift: boolean;
      presence: PresenceStatus | null;
      shiftStartedAt: string | null;
    }[];
  };
  today: {
    shiftStarts: number;
    uniqueStarters: number;
    shiftEnds: number;
    breakStarts: number;
    focusStarts: number;
    toolOpens: number;
    loginStarts: number;
    manualStarts: number;
  };
  toolLinks: { label: string; host: string; count: number }[];
  people: {
    userId: string;
    email: string;
    name: string | null;
    eventCount: number;
    firstEventAt: string | null;
    lastEventAt: string | null;
    shiftStarts: number;
    toolOpens: number;
  }[];
};

export async function fetchShiftDashboard(date?: string): Promise<ShiftDashboard> {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return (await shiftFetch(`/api/admin/shift/dashboard${q}`)) as ShiftDashboard;
}

export async function fetchTeamShiftToday(): Promise<{
  expected: number;
  started: number;
  onShift: number;
  ended: number;
  notStarted: number;
  working: number;
  onBreak: number;
  inFocus: number;
  offShift: number;
  members: TeamShiftMember[];
}> {
  const data = (await shiftFetch("/api/admin/shift/today")) as {
    expected: number;
    started: number;
    onShift: number;
    ended: number;
    notStarted: number;
    working?: number;
    available?: number;
    onBreak: number;
    inFocus: number;
    offShift?: number;
    members: TeamShiftMember[];
  };
  return {
    ...data,
    working: data.working ?? data.available ?? 0,
    offShift: data.offShift ?? data.expected - data.onShift,
  };
}

export async function fetchMyShiftTrends(): Promise<{
  periodDays: number;
  startedShifts: number;
  completedShifts: number;
  avgFocusSessionsPerShift: number;
}> {
  return (await shiftFetch("/api/shift/trends")) as {
    periodDays: number;
    startedShifts: number;
    completedShifts: number;
    avgFocusSessionsPerShift: number;
  };
}

export async function fetchTeamShiftTrends(): Promise<{
  periodDays: number;
  startedShifts: number;
  completedShifts: number;
  avgFocusSessionsPerShift: number;
  note?: string;
}> {
  return (await shiftFetch("/api/admin/shift/trends")) as {
    periodDays: number;
    startedShifts: number;
    completedShifts: number;
    avgFocusSessionsPerShift: number;
    note?: string;
  };
}
