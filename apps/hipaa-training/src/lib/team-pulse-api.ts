import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { PresenceStatus } from "@/lib/shift-api";

export type TeamPulseMember = {
  id: string;
  name: string | null;
  email: string;
  onShift: boolean;
  presence: PresenceStatus | null;
  openTasksToday: number;
  taskTitles: string[];
};

export type TeamPulse = {
  date: string;
  timezone: string;
  generatedAt: string;
  live: {
    working: number;
    onBreak: number;
    inFocus: number;
    onShift: number;
    offShift: number;
  };
  members: TeamPulseMember[];
};

export async function fetchTeamPulse(): Promise<TeamPulse> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in to see the team board.");
  const res = await fetch(`${base}/api/team/pulse`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as TeamPulse & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
