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
  status: "in_progress" | "draft_ready" | "submitted" | "published";
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

export type SopBuilderEmailStatus = {
  sent: boolean;
  error?: string;
  to?: string[];
  id?: string;
};

export async function patchSopBuilderSession(
  id: string,
  patch: {
    transcript?: SopBuilderTranscriptEntry[];
    draftJson?: SopBuilderSessionRecord["draftJson"];
    status?: SopBuilderSessionRecord["status"];
  },
): Promise<{ session: SopBuilderSessionRecord; email: SopBuilderEmailStatus | null }> {
  // Same-origin BFF fires Resend on submitted/published transitions.
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch(`/api/sop-builder/sessions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  const data = (await res.json().catch(() => ({}))) as {
    session?: SopBuilderSessionRecord;
    email?: SopBuilderEmailStatus | null;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  if (!data.session) throw new Error("No session returned");
  return { session: data.session, email: data.email ?? null };
}

export async function fetchSubmittedSopBuilderSessions(): Promise<
  (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[]
> {
  const data = (await builderFetch("/api/admin/sop-builder/submitted")) as {
    sessions: (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[];
  };
  return data.sessions ?? [];
}

/** Admin audit: recent builder sessions (any status). */
export async function fetchAdminSopBuilderSessions(q?: string): Promise<
  (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[]
> {
  const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  const data = (await builderFetch(`/api/admin/sop-builder/sessions${qs}`)) as {
    sessions: (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[];
  };
  return data.sessions ?? [];
}

export async function fetchChecklistSubmitFeedback(opts: {
  title: string;
  description: string;
  steps: string[];
}): Promise<{
  feedback: {
    purposeComplete: boolean;
    scopeComplete: boolean;
    stepsComplete: boolean;
    exceptionsComplete: boolean;
    escalationComplete: boolean;
    stepsSpecific: boolean;
    possibleDuplicate: boolean;
    duplicateOfTitle: string | null;
    summary: string;
    suggestions: string[];
    readyHint: "looks_ready" | "needs_work";
  };
  note?: string;
}> {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch("/api/sop-builder/submit-feedback", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
  const data = (await res.json().catch(() => ({}))) as {
    feedback?: {
      purposeComplete: boolean;
      scopeComplete: boolean;
      stepsComplete: boolean;
      exceptionsComplete: boolean;
      escalationComplete: boolean;
      stepsSpecific: boolean;
      possibleDuplicate: boolean;
      duplicateOfTitle: string | null;
      summary: string;
      suggestions: string[];
      readyHint: "looks_ready" | "needs_work";
    };
    note?: string;
    error?: string;
  };
  if (!res.ok || !data.feedback) throw new Error(data.error || "AI review failed");
  return { feedback: data.feedback, note: data.note };
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
  readonly code: string;
  readonly kind: string;
  constructor(message: string, code = "llm_error", kind = "unknown") {
    super(message);
    this.name = "SopBuilderUnavailableError";
    this.code = code;
    this.kind = kind;
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
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string; kind?: string };
  if (!res.ok) {
    const code = data.code || "";
    if (
      res.status === 503 &&
      (code.startsWith("llm_") || code === "llm_unavailable")
    ) {
      throw new SopBuilderUnavailableError(
        data.error || "AI interview unavailable",
        code === "llm_unavailable" ? "llm_error" : code,
        data.kind || "unknown",
      );
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

export async function generateSopBuilderDraft(
  sessionId: string,
  opts?: {
    refineInstruction?: string;
    currentDraft?: {
      title: string;
      description: string;
      checklistItems: { label: string; order: number }[];
      gaps?: string[];
    };
  },
): Promise<{
  session: SopBuilderSessionRecord;
  draft: SopBuilderChecklistDraft;
  refined?: boolean;
}> {
  return sopBuilderRoute("/api/sop-builder/draft", {
    sessionId,
    refineInstruction: opts?.refineInstruction,
    currentDraft: opts?.currentDraft,
  }) as Promise<{
    session: SopBuilderSessionRecord;
    draft: SopBuilderChecklistDraft;
    refined?: boolean;
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
