import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type ChatReviewStatus = "open" | "closed";

export type ChatReviewRecord = {
  id: string;
  userId: string;
  reviewDate: string;
  patientIdentifier: string;
  notes: string;
  errorNotes: string;
  status: ChatReviewStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string;
  reviewerDepartment?: string | null;
};

export type HandoffFollowup = {
  patientIdentifier: string;
  note: string;
};

export type ShiftHandoffRecord = {
  id: string;
  userId: string;
  shiftEndEventId: string | null;
  handoffDate: string;
  chatsHandledCount: number | null;
  callsMadeCount: number | null;
  callsReceivedCount: number | null;
  pendingFollowups: HandoffFollowup[];
  scheduledItemsToday: string | null;
  generalNotes: string | null;
  createdAt: string;
  userName?: string | null;
  userEmail?: string;
};

async function opsFetch(path: string, init?: RequestInit) {
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

export async function fetchMyChatReviews(opts?: {
  date?: string;
  status?: ChatReviewStatus;
}): Promise<ChatReviewRecord[]> {
  const q = new URLSearchParams();
  q.set("date", opts?.date ?? "today");
  if (opts?.status) q.set("status", opts.status);
  const data = (await opsFetch(`/api/chat-reviews?${q}`)) as { reviews: ChatReviewRecord[] };
  return data.reviews ?? [];
}

export async function createChatReview(payload: {
  patientIdentifier: string;
  notes?: string;
  errorNotes?: string;
  status?: ChatReviewStatus;
}): Promise<ChatReviewRecord> {
  const data = (await opsFetch("/api/chat-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { review: ChatReviewRecord };
  return data.review;
}

export async function patchChatReview(
  id: string,
  patch: Partial<{
    patientIdentifier: string;
    notes: string;
    errorNotes: string;
    status: ChatReviewStatus;
  }>,
): Promise<ChatReviewRecord> {
  const data = (await opsFetch(`/api/chat-reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as { review: ChatReviewRecord };
  return data.review;
}

export async function fetchAdminChatReviews(opts?: {
  date?: string;
  status?: ChatReviewStatus;
}): Promise<ChatReviewRecord[]> {
  const q = new URLSearchParams();
  q.set("date", opts?.date ?? "today");
  if (opts?.status) q.set("status", opts.status);
  const data = (await opsFetch(`/api/admin/chat-reviews?${q}`)) as { reviews: ChatReviewRecord[] };
  return data.reviews ?? [];
}

export async function fetchShiftHandoffs(date = "today"): Promise<ShiftHandoffRecord[]> {
  const data = (await opsFetch(`/api/shift-handoffs?date=${encodeURIComponent(date)}`)) as {
    handoffs: ShiftHandoffRecord[];
  };
  return data.handoffs ?? [];
}

export async function submitShiftHandoff(payload: {
  shiftEndEventId?: string | null;
  chatsHandledCount?: number | null;
  callsMadeCount?: number | null;
  callsReceivedCount?: number | null;
  pendingFollowups?: HandoffFollowup[];
  scheduledItemsToday?: string;
  generalNotes?: string;
}): Promise<ShiftHandoffRecord> {
  const data = (await opsFetch("/api/shift-handoffs", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { handoff: ShiftHandoffRecord };
  return data.handoff;
}

export async function fetchChatReviewAccess(): Promise<{ canReview: boolean; isAdmin: boolean }> {
  const data = (await opsFetch("/api/chat-reviews/access")) as { canReview?: boolean; isAdmin?: boolean };
  return { canReview: Boolean(data.canReview), isAdmin: Boolean(data.isAdmin) };
}

/** @deprecated Use fetchChatReviewAccess for chat review gates */
export async function fetchOpsLeadAccess(): Promise<{ canViewTeamReviews: boolean; isAdmin: boolean }> {
  const access = await fetchChatReviewAccess();
  return { canViewTeamReviews: access.canReview, isAdmin: access.isAdmin };
}
