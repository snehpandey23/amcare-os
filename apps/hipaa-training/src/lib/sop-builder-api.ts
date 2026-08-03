import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { SopBuilderChecklistDraft, SopBuilderSourceRefs, SopBuilderTranscriptEntry } from "@/lib/sop-builder-assist";

export type SopBuilderSessionRecord = {
  id: string;
  userId: string;
  topic: string;
  transcript: SopBuilderTranscriptEntry[];
  sourceMaterialRefs: SopBuilderSourceRefs;
  draftJson: (SopBuilderChecklistDraft & { checklistItems: { id: string; label: string; order: number }[] }) | null;
  status: "in_progress" | "draft_ready" | "submitted";
  createdAt: string;
  updatedAt: string;
};

export type SopFeedbackRecord = {
  id: string;
  sopTemplateId: string;
  checklistItemId: string;
  userId: string;
  note: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  userName?: string | null;
  templateTitle?: string | null;
  itemLabel?: string | null;
};

async function builderFetch(path: string, init?: RequestInit) {
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

export async function fetchSopBuilderAccess(): Promise<{ canBuild: boolean; isAdmin: boolean }> {
  return (await builderFetch("/api/sop-builder/access")) as { canBuild: boolean; isAdmin: boolean };
}

export async function fetchSopBuilderSessions(): Promise<SopBuilderSessionRecord[]> {
  const data = (await builderFetch("/api/sop-builder/sessions")) as { sessions: SopBuilderSessionRecord[] };
  return data.sessions ?? [];
}

export async function fetchSopBuilderSession(id: string): Promise<SopBuilderSessionRecord> {
  const data = (await builderFetch(`/api/sop-builder/sessions/${id}`)) as { session: SopBuilderSessionRecord };
  return data.session;
}

export async function patchSopBuilderSession(
  id: string,
  patch: {
    transcript?: SopBuilderTranscriptEntry[];
    draftJson?: SopBuilderSessionRecord["draftJson"];
    status?: SopBuilderSessionRecord["status"];
  },
): Promise<SopBuilderSessionRecord> {
  const data = (await builderFetch(`/api/sop-builder/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as { session: SopBuilderSessionRecord };
  return data.session;
}

export async function fetchSubmittedSopBuilderSessions(): Promise<
  (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[]
> {
  const data = (await builderFetch("/api/admin/sop-builder/submitted")) as {
    sessions: (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[];
  };
  return data.sessions ?? [];
}

export async function submitSopFeedback(payload: {
  sopTemplateId: string;
  checklistItemId: string;
  note: string;
}): Promise<SopFeedbackRecord> {
  const data = (await builderFetch("/api/sop-feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { feedback: SopFeedbackRecord };
  return data.feedback;
}

export async function fetchUnresolvedSopFeedback(): Promise<SopFeedbackRecord[]> {
  const data = (await builderFetch("/api/admin/sop-feedback")) as { feedback: SopFeedbackRecord[] };
  return data.feedback ?? [];
}

export async function resolveSopFeedback(id: string): Promise<SopFeedbackRecord> {
  const data = (await builderFetch(`/api/admin/sop-feedback/${id}/resolve`, { method: "PATCH" })) as {
    feedback: SopFeedbackRecord;
  };
  return data.feedback;
}

export class SopBuilderUnavailableError extends Error {
  readonly code = "llm_unavailable" as const;
  constructor(message: string) {
    super(message);
    this.name = "SopBuilderUnavailableError";
  }
}

async function sopBuilderRoute(path: string, body: unknown, auth?: string) {
  const token = auth?.replace(/^Bearer\s+/i, "") || getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) {
    if (res.status === 503 && data.code === "llm_unavailable") {
      throw new SopBuilderUnavailableError(data.error || "AI interview unavailable");
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function startSopBuilderInterview(topic: string): Promise<{
  session: SopBuilderSessionRecord;
  questions: string[];
  readyToDraft: boolean;
}> {
  return sopBuilderRoute("/api/sop-builder/start", { topic }) as Promise<{
    session: SopBuilderSessionRecord;
    questions: string[];
    readyToDraft: boolean;
  }>;
}

export async function answerSopBuilderQuestion(
  sessionId: string,
  answer: string,
  skipped = false,
): Promise<{
  session: SopBuilderSessionRecord;
  question: string | null;
  readyToDraft: boolean;
  questionNumber: number;
}> {
  return sopBuilderRoute("/api/sop-builder/answer", { sessionId, answer, skipped }) as Promise<{
    session: SopBuilderSessionRecord;
    question: string | null;
    readyToDraft: boolean;
    questionNumber: number;
  }>;
}

export async function generateSopBuilderDraft(sessionId: string): Promise<{
  session: SopBuilderSessionRecord;
  draft: SopBuilderChecklistDraft;
}> {
  return sopBuilderRoute("/api/sop-builder/draft", { sessionId }) as Promise<{
    session: SopBuilderSessionRecord;
    draft: SopBuilderChecklistDraft;
  }>;
}

export async function resumeSopBuilderSession(sessionId: string): Promise<{
  session: SopBuilderSessionRecord;
  pendingQuestion: string | null;
  readyToDraft: boolean;
}> {
  return sopBuilderRoute("/api/sop-builder/resume", { sessionId }) as Promise<{
    session: SopBuilderSessionRecord;
    pendingQuestion: string | null;
    readyToDraft: boolean;
  }>;
}
