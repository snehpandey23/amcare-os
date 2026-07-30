import type pg from "pg";

const SYNC_TTL_MS = 5 * 60 * 1000;

let lastSyncKey = "";
let lastSyncAt = 0;
let inFlight: Promise<number> | null = null;

/** Avoid running full knowledge→daily sync on every poll / My Day refresh. */
export async function maybeSyncKnowledgeWorkToDailyBoard(
  pool: pg.Pool,
  dueDate: string,
  opts?: { force?: boolean },
): Promise<number> {
  const force = opts?.force === true;
  const now = Date.now();
  if (!force && lastSyncKey === dueDate && now - lastSyncAt < SYNC_TTL_MS) {
    return 0;
  }
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { syncKnowledgeWorkToDailyBoard } = await import("./task-service.js");
    const n = await syncKnowledgeWorkToDailyBoard(pool, dueDate);
    lastSyncKey = dueDate;
    lastSyncAt = Date.now();
    return n;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** Test / admin “sync now” — bypass throttle. */
export function resetKnowledgeSyncThrottle(): void {
  lastSyncKey = "";
  lastSyncAt = 0;
  inFlight = null;
}
