/** Per-window Assist session — login / new window starts a fresh thread; old chats stay in the list. */

import { createAssistThread, type AssistThread } from "@/lib/assist-chat-api";

export const ASSIST_SESSION_BOOTED_KEY = "siya-assist-session-booted";
export const ASSIST_SESSION_ACTIVE_KEY = "siya-assist-active-thread";

/** One create per window so Strict Mode remounts do not open two blank threads. */
let freshCreateInflight: Promise<AssistThread> | null = null;

export function getAssistSessionBooted(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ASSIST_SESSION_BOOTED_KEY) === "1";
}

export function markAssistSessionBooted(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ASSIST_SESSION_BOOTED_KEY, "1");
}

export function getAssistSessionActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ASSIST_SESSION_ACTIVE_KEY);
}

export function setAssistSessionActiveId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) sessionStorage.setItem(ASSIST_SESSION_ACTIVE_KEY, id);
  else sessionStorage.removeItem(ASSIST_SESSION_ACTIVE_KEY);
}

export function createFreshAssistThreadOnce(): Promise<AssistThread> {
  if (!freshCreateInflight) freshCreateInflight = createAssistThread();
  return freshCreateInflight;
}

export function clearAssistSession(): void {
  freshCreateInflight = null;
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ASSIST_SESSION_BOOTED_KEY);
  sessionStorage.removeItem(ASSIST_SESSION_ACTIVE_KEY);
}
