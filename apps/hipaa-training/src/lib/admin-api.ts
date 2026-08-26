import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type TeamRosterMember = {
  id: string;
  email: string;
  name: string | null;
  portalRole: string;
  createdAt: string;
  lastLoginAt: string | null;
  deactivatedAt: string | null;
  progressUpdatedAt: string | null;
  training: {
    workforceRole: string;
    learnerName: string | null;
    modulesCompleted: number;
    finalExamReady: boolean;
    secondsInCourse: number;
    updatedAt: string | null;
  };
  levelUp: {
    totalXp: number;
    streak: number;
    lastActiveDate: string;
    chatPracticeSessions: number;
    usCultureSessions: number;
    billingPracticeSessions: number;
    dailyLearningSessions: number;
    /** Day ledger for shared weekly report (identical staff/admin builder). */
    dayLedger?: unknown[];
  };
};

async function adminFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in as an admin to manage the team.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; members?: TeamRosterMember[]; user?: unknown };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchTeamRoster(): Promise<TeamRosterMember[]> {
  const data = await adminFetch("/api/admin/team/roster");
  return data.members ?? [];
}

export async function fetchTeamMember(userId: string): Promise<TeamRosterMember> {
  const data = (await adminFetch(`/api/admin/users/${userId}`)) as { member: TeamRosterMember };
  if (!data.member) throw new Error("User not found");
  return data.member;
}

export async function inviteTeamMember(input: {
  email: string;
  name: string;
  password: string;
  role: "admin" | "trainee";
}) {
  return adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTeamMember(
  userId: string,
  input: { name?: string; role?: "admin" | "trainee"; password?: string },
) {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTeamMember(userId: string) {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}
