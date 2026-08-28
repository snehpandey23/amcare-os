import { getTrainingApiUrl, isPortalAuthEnabled } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { DailyCompletion, LevelUpProgress } from "@/lib/level-up/progress";
import { DAY_LEDGER_MAX_ENTRIES } from "@/lib/level-up/progress";

const REMOTE_DEBOUNCE_MS = 800;

let remoteTimer: ReturnType<typeof setTimeout> | null = null;
let latestRemote: LevelUpProgress | null = null;

export function canSyncLevelUp(): boolean {
  return isPortalAuthEnabled() && !!getStoredToken();
}

export async function pullLevelUpFromServer(token: string): Promise<LevelUpProgress | null> {
  const api = getTrainingApiUrl();
  if (!api) return null;
  try {
    const res = await fetch(`${api}/api/level-up/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { progress: LevelUpProgress | null };
    if (!data.progress || typeof data.progress !== "object") return null;
    return data.progress;
  } catch {
    return null;
  }
}

export async function pushLevelUpToServer(state: LevelUpProgress): Promise<boolean> {
  const api = getTrainingApiUrl();
  const token = getStoredToken();
  if (!api || !token) return false;
  try {
    const res = await fetch(`${api}/api/level-up/progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function scheduleLevelUpRemoteSave(state: LevelUpProgress): void {
  if (!canSyncLevelUp()) return;
  latestRemote = state;
  if (remoteTimer) clearTimeout(remoteTimer);
  remoteTimer = setTimeout(() => {
    remoteTimer = null;
    const s = latestRemote;
    if (s) void pushLevelUpToServer(s);
  }, REMOTE_DEBOUNCE_MS);
}

/** Prefer higher XP; union same-day completions + day ledger by id so history is not lost after sync. */
export function mergeLevelUpProgress(local: LevelUpProgress, remote: LevelUpProgress | null): LevelUpProgress {
  if (!remote) return local;
  const today = new Date().toISOString().slice(0, 10);
  const totalXp = Math.max(local.totalXp, remote.totalXp);
  const streak = Math.max(local.streak, remote.streak);
  const lastActiveDate =
    local.lastActiveDate >= remote.lastActiveDate ? local.lastActiveDate : remote.lastActiveDate;
  let completedToday = local.completedToday;
  if (local.lastActiveDate === today && remote.lastActiveDate === today) {
    completedToday = [...new Set([...local.completedToday, ...remote.completedToday])] as LevelUpProgress["completedToday"];
  } else if (remote.lastActiveDate === today && local.lastActiveDate !== today) {
    completedToday = remote.completedToday;
  }
  const lifetimeDrills = { ...remote.lifetimeDrills, ...local.lifetimeDrills };
  for (const k of Object.keys(lifetimeDrills) as DailyCompletion[]) {
    lifetimeDrills[k] = Math.max(local.lifetimeDrills?.[k] ?? 0, remote.lifetimeDrills?.[k] ?? 0);
  }
  const byId = new Map<string, NonNullable<LevelUpProgress["dayLedger"]>[number]>();
  for (const e of [...(remote.dayLedger ?? []), ...(local.dayLedger ?? [])]) {
    byId.set(e.id, e);
  }
  const dayLedger = [...byId.values()].sort((a, b) => a.at - b.at).slice(-DAY_LEDGER_MAX_ENTRIES);
  return { streak, lastActiveDate, completedToday, totalXp, lifetimeDrills, dayLedger };
}
