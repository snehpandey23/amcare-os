/**
 * Siya Assist v2 — thread CRUD against auth API.
 */
import { getStoredToken } from "@/lib/authStorage";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export type AssistThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
};

export type AssistThreadMessage = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

async function assistFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getTrainingApiUrl();
  if (!base) throw new Error("API not configured");
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required");
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${base}${path}`, { ...init, headers });
}

export async function listAssistThreads(q?: string): Promise<AssistThread[]> {
  const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  const res = await assistFetch(`/api/assist/threads${qs}`);
  const data = (await res.json().catch(() => ({}))) as { threads?: AssistThread[]; error?: string };
  if (!res.ok) throw new Error(data.error || "Could not load chats");
  return data.threads ?? [];
}

export async function createAssistThread(title?: string): Promise<AssistThread> {
  const res = await assistFetch("/api/assist/threads", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  const data = (await res.json().catch(() => ({}))) as { thread?: AssistThread; error?: string };
  if (!res.ok || !data.thread) throw new Error(data.error || "Could not create chat");
  return data.thread;
}

export async function loadAssistThread(
  id: string,
): Promise<{ thread: AssistThread; messages: AssistThreadMessage[] }> {
  const res = await assistFetch(`/api/assist/threads/${encodeURIComponent(id)}`);
  const data = (await res.json().catch(() => ({}))) as {
    thread?: AssistThread;
    messages?: AssistThreadMessage[];
    error?: string;
  };
  if (!res.ok || !data.thread) throw new Error(data.error || "Chat not found");
  return { thread: data.thread, messages: data.messages ?? [] };
}

export async function archiveAssistThread(id: string): Promise<void> {
  const res = await assistFetch(`/api/assist/threads/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    body: "{}",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Could not archive chat");
  }
}

export async function fetchAssistHistoryForLlm(
  threadId: string,
  limit = 24,
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const res = await assistFetch(
    `/api/assist/threads/${encodeURIComponent(threadId)}/history?limit=${limit}`,
  );
  const data = (await res.json().catch(() => ({}))) as {
    history?: { role: "user" | "assistant"; content: string }[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "Could not load history");
  return data.history ?? [];
}
