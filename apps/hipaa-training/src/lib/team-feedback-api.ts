import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type FeedbackTargetKind = "peer" | "lead";

export type RecipientFacingFeedback = {
  id: string;
  body: string;
  targetKind: FeedbackTargetKind;
  createdAt: string;
  attribution: { mode: "named"; displayName: string } | { mode: "anonymous" };
};

export type DirectoryPerson = {
  id: string;
  name: string | null;
  email: string;
  kind: FeedbackTargetKind;
  leadDepartments?: string[];
};

async function fbFetch(path: string, init?: RequestInit) {
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

export async function fetchFeedbackDirectory(): Promise<{
  peers: DirectoryPerson[];
  leads: DirectoryPerson[];
}> {
  return (await fbFetch("/api/team-feedback/directory")) as {
    peers: DirectoryPerson[];
    leads: DirectoryPerson[];
  };
}

export async function fetchFeedbackInbox(): Promise<{
  items: RecipientFacingFeedback[];
  note?: string;
}> {
  return (await fbFetch("/api/team-feedback/inbox")) as {
    items: RecipientFacingFeedback[];
    note?: string;
  };
}

/** Same-origin BFF — proxies auth API and sends Resend recipient notification. */
async function staffPortalFeedbackFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch(path, {
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

export async function submitTeamFeedback(input: {
  recipientUserId: string;
  targetKind: FeedbackTargetKind;
  body: string;
  anonymous: boolean;
}): Promise<{ recipientFacing: RecipientFacingFeedback }> {
  const data = (await staffPortalFeedbackFetch("/api/team-feedback", {
    method: "POST",
    body: JSON.stringify(input),
  })) as { recipientFacing: RecipientFacingFeedback };
  return data;
}
