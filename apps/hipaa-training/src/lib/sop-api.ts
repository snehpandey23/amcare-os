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
}> {
  const data = (await sopFetch("/api/knowledge/sops/context")) as {
    departments: string[];
    isAdmin: boolean;
    myLeadSlugs: string[];
    departmentLeads: DepartmentLead[];
  };
  return data;
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

export async function submitSopForReview(id: string): Promise<SopRecord> {
  const data = (await sopFetch(`/api/knowledge/sops/${id}/submit`, { method: "POST", body: "{}" })) as {
    sop: SopRecord;
  };
  return data.sop;
}

export async function fetchSopReviewQueue(): Promise<SopRecord[]> {
  const data = (await sopFetch("/api/admin/sops/review-queue")) as { sops: SopRecord[] };
  return data.sops ?? [];
}

export async function approveSop(id: string): Promise<SopRecord> {
  const data = (await sopFetch(`/api/admin/sops/${id}/approve`, { method: "POST", body: "{}" })) as {
    sop: SopRecord;
  };
  return data.sop;
}

export async function sendBackSop(id: string, comment: string): Promise<SopRecord> {
  const data = (await sopFetch(`/api/admin/sops/${id}/send-back`, {
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

export async function fetchSopDraftAssist(
  department: string,
  answers: SopDraftAnswers,
): Promise<{ title: string; body: string }> {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch("/api/knowledge/sops/draft-assist", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ department, answers }),
  });
  const data = (await res.json().catch(() => ({}))) as { draft?: { title: string; body: string }; error?: string };
  if (!res.ok) throw new Error(data.error || "Draft assist failed");
  if (!data.draft) throw new Error("No draft returned");
  return data.draft;
}
