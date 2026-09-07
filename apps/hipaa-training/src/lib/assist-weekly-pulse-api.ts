import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type AssistWeeklyPulse = {
  periodDays: number;
  since: string;
  generatedAt: string;
  assistantTurns: number;
  gapTurns: number;
  firstAnswerRatePct: number | null;
  gapsOpened: number;
  gapsResolved: number;
  gapsStillOpen: number;
  feedbackHelpful: number;
  feedbackUnhelpful: number;
  feedbackHelpfulRatePct: number | null;
  notes: string[];
};

export async function fetchAssistWeeklyPulse(days = 7): Promise<AssistWeeklyPulse> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}/api/assist/weekly-pulse?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    pulse?: AssistWeeklyPulse;
  };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  if (!data.pulse) throw new Error("No pulse returned.");
  return data.pulse;
}
