import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type EomNomineeOption = {
  id: string;
  name: string | null;
  email: string;
};

export type EomMyNomination = {
  id: string;
  nomineeUserId: string;
  nomineeName: string | null;
  nomineeEmail: string;
  reason: string;
  createdAt: string;
  isSelf: boolean;
};

export type EomMonthStatus = {
  monthKey: string;
  monthLabel: string;
  prizeCopy: string;
  nudgeDay: boolean;
  hasNominatedThisMonth: boolean;
  myNominations: EomMyNomination[];
  nominees: EomNomineeOption[];
};

async function eomFetch(path: string, init?: RequestInit) {
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

export async function fetchEomMonthStatus(monthKey?: string): Promise<EomMonthStatus> {
  const q = monthKey ? `?month=${encodeURIComponent(monthKey)}` : "";
  return (await eomFetch(`/api/eom-nominations/status${q}`)) as EomMonthStatus;
}

export async function submitEomNomination(input: {
  nomineeUserId: string;
  reason: string;
}): Promise<{ ok: true; nomination: EomMyNomination }> {
  return (await eomFetch("/api/eom-nominations", {
    method: "POST",
    body: JSON.stringify(input),
  })) as { ok: true; nomination: EomMyNomination };
}

/** Client-side IST day check for nudge (matches API). */
export function isEomNudgeDayClient(now = new Date()): boolean {
  const day = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric" }).format(now),
  );
  return day === 20 || day === 25;
}

const DISMISS_KEY = "siya-eom-nudge-dismiss";

export function isEomNudgeDismissedForToday(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return raw === day;
  } catch {
    return false;
  }
}

export function dismissEomNudgeForToday(): void {
  if (typeof window === "undefined") return;
  try {
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    localStorage.setItem(DISMISS_KEY, day);
  } catch {
    /* ignore */
  }
}
