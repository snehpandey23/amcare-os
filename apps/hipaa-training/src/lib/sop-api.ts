import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { DepartmentLead, SopRecord, SopTaskRecord, SopTaskType } from "@/lib/sop-types";
import type { SopDraftAnswers } from "@/lib/sop-draft-assist";

async function sopFetch(path: string, init?: RequestInit) {
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

export async function fetchTeamAssignees(): Promise<{ id: string; name: string | null; email: string }[]> {
  const data = (await sopFetch("/api/knowledge/team-assignees")) as {
    members: { id: string; name: string | null; email: string }[];
  };
  return data.members ?? [];
}

export async function fetchMySopOwnership(): Promise<string[]> {
  const data = (await sopFetch("/api/knowledge/sops/my-ownership")) as { departments: string[] };
  return data.departments ?? [];
}

export async function fetchSopContext(): Promise<{
  departments: string[];
  isAdmin: boolean;
  myLeadSlugs: string[];
  departmentLeads: DepartmentLead[];
  approvalRoutes: {
    department: string;
    departmentSlug: string;
    approvalMode: "lead_self" | "founder";
    reason: string;
    reviewerLabel: string;
    leadName: string | null;
    leadEmail: string | null;
  }[];
}> {
  const data = (await sopFetch("/api/knowledge/sops/context")) as {
    departments: string[];
    isAdmin: boolean;
    myLeadSlugs: string[];
    departmentLeads: DepartmentLead[];
    approvalRoutes?: {
      department: string;
      departmentSlug: string;
      approvalMode: "lead_self" | "founder";
      reason: string;
      reviewerLabel: string;
      leadName: string | null;
      leadEmail: string | null;
    }[];
  };
  return {
    ...data,
    approvalRoutes: data.approvalRoutes ?? [],
  };
}

export async function fetchSopsForRetrieval(authToken?: string | null): Promise<
  { id: string; title: string; body: string; keywords: string[]; status: string; department: string }[]
> {
  const base = getTrainingApiUrl();
  const token = authToken?.trim() || getStoredToken();
  if (!base || !token) return [];
  const res = await fetch(`${base}/api/knowledge/sops/retrieval`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as {
    sops?: { id: string; title: string; body: string; keywords: string[]; status: string; department: string }[];
  };
  return data.sops ?? [];
}

export async function fetchSops(opts?: { department?: string; status?: string }): Promise<SopRecord[]> {
  const q = new URLSearchParams();
  if (opts?.department) q.set("department", opts.department);
  if (opts?.status) q.set("status", opts.status);
  const data = (await sopFetch(`/api/knowledge/sops?${q}`)) as { sops: SopRecord[] };
  return data.sops ?? [];
}

export async function fetchSopTasks(department?: string): Promise<SopTaskRecord[]> {
  const q = department ? `?department=${encodeURIComponent(department)}` : "";
  const data = (await sopFetch(`/api/knowledge/sop-tasks${q}`)) as { tasks: SopTaskRecord[] };
  return data.tasks ?? [];
}

export async function createSop(payload: {
  department: string;
  title: string;
  body?: string;
  keywords?: string[];
  reviewDate?: string;
  halfLifeDays?: number;
  aiDrafted?: boolean;
}): Promise<SopRecord> {
  const data = (await sopFetch("/api/knowledge/sops", { method: "POST", body: JSON.stringify(payload) })) as {
    sop: SopRecord;
  };
  return data.sop;
}

export async function updateSop(
  id: string,
  patch: {
    title?: string;
    body?: string;
    keywords?: string[];
    reviewDate?: string;
    halfLifeDays?: number;
  },
): Promise<SopRecord> {
  const data = (await sopFetch(`/api/knowledge/sops/${id}`, { method: "PATCH", body: JSON.stringify(patch) })) as {
    sop: SopRecord;
  };
  return data.sop;
}

/** Same-origin BFF — proxies auth API and sends Resend review emails. */
async function staffPortalFetch(path: string, init?: RequestInit) {
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

export type SopSubmitEmailStatus = {
  sent: boolean;
  error?: string;
  to?: string[];
  id?: string;
};

export async function submitSopForReview(
  id: string,
): Promise<{ sop: SopRecord; email: SopSubmitEmailStatus | null }> {
  const data = (await staffPortalFetch(`/api/knowledge/sops/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    body: "{}",
  })) as { sop: SopRecord; email?: SopSubmitEmailStatus | null };
  if (!data.sop) throw new Error("Submit failed");
  return { sop: data.sop, email: data.email ?? null };
}

export async function fetchSopReviewQueue(): Promise<SopRecord[]> {
  const data = (await sopFetch("/api/admin/sops/review-queue")) as { sops: SopRecord[] };
  return data.sops ?? [];
}

export async function approveSop(id: string): Promise<SopRecord> {
  const data = (await staffPortalFetch(`/api/admin/sops/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    body: "{}",
  })) as { sop: SopRecord };
  return data.sop;
}

export async function sendBackSop(id: string, comment: string): Promise<SopRecord> {
  const data = (await staffPortalFetch(`/api/admin/sops/${encodeURIComponent(id)}/send-back`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  })) as { sop: SopRecord };
  return data.sop;
}

export async function fetchDepartmentLeadsAdmin(): Promise<DepartmentLead[]> {
  const data = (await sopFetch("/api/admin/department-leads")) as { leads: DepartmentLead[] };
  return data.leads ?? [];
}

export async function setDepartmentLead(slug: string, userId: string | null): Promise<DepartmentLead[]> {
  const data = (await sopFetch(`/api/admin/department-leads/${slug}`, {
    method: "PUT",
    body: JSON.stringify({ userId }),
  })) as { leads: DepartmentLead[] };
  return data.leads ?? [];
}

export async function patchSopTask(
  id: string,
  patch: { assigneeUserId?: string | null; dueDate?: string | null; status?: "open" | "done" },
): Promise<SopTaskRecord> {
  const data = (await sopFetch(`/api/knowledge/sop-tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as { task: SopTaskRecord };
  return data.task;
}

export async function createSopTask(payload: {
  department: string;
  taskType: SopTaskType;
  title: string;
  sopId?: string;
  assigneeUserId?: string;
  dueDate?: string;
}): Promise<SopTaskRecord> {
  const data = (await sopFetch("/api/knowledge/sop-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { task: SopTaskRecord };
  return data.task;
}

export type SopDraftAssistOk = {
  ok: true;
  draft: { title: string; body: string; method?: string; note?: string };
  note?: string;
  method?: string;
};
export type SopDraftAssistThin = {
  ok: false;
  code: "answers_not_substantive";
  followUp: string;
  weakFields?: string[];
  reason?: string;
};
export type SopDraftAssistFail = {
  ok: false;
  code: string;
  error: string;
  retryable?: boolean;
};

export async function fetchSopDraftAssist(
  department: string,
  answers: SopDraftAnswers | null,
  opts?: {
    acceptThinAnswers?: boolean;
    refineInstruction?: string;
    currentDraft?: { title: string; body: string };
  },
): Promise<SopDraftAssistOk | SopDraftAssistThin | SopDraftAssistFail> {
  const token = getStoredToken();
  if (!token) return { ok: false, code: "auth", error: "Sign in required." };
  const res = await fetch("/api/knowledge/sops/draft-assist", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      department,
      answers: answers ?? undefined,
      acceptThinAnswers: Boolean(opts?.acceptThinAnswers),
      refineInstruction: opts?.refineInstruction,
      currentDraft: opts?.currentDraft,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    draft?: { title: string; body: string; method?: string; note?: string };
    error?: string;
    code?: string;
    followUp?: string;
    weakFields?: string[];
    reason?: string;
    retryable?: boolean;
    note?: string;
    method?: string;
  };
  if (res.status === 422 && data.code === "answers_not_substantive") {
    return {
      ok: false,
      code: "answers_not_substantive",
      followUp: data.followUp || data.error || "Some answers need more detail.",
      weakFields: data.weakFields,
      reason: data.reason,
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      code: data.code || "draft_assist_failed",
      error: data.error || "Draft assist failed",
      retryable: data.retryable,
    };
  }
  if (!data.draft) return { ok: false, code: "draft_assist_failed", error: "No draft returned" };
  return {
    ok: true,
    draft: data.draft,
    note: data.note || data.draft.note,
    method: data.method || data.draft.method,
  };
}

export type SopSubmitFeedbackPayload = {
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
  heuristicOnly?: boolean;
};

export async function fetchSopSubmitFeedback(opts: {
  title: string;
  body: string;
  department: string;
}): Promise<{ feedback: SopSubmitFeedbackPayload; note?: string }> {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch("/api/knowledge/sops/submit-feedback", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
  const data = (await res.json().catch(() => ({}))) as {
    feedback?: SopSubmitFeedbackPayload;
    note?: string;
    error?: string;
  };
  if (!res.ok || !data.feedback) throw new Error(data.error || "AI review failed");
  return { feedback: data.feedback, note: data.note };
}
