"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS, SIYA_ADMIN_OPENING, ADMIN_CHAT_QUICK_PROMPTS, CHAT_SECTION_LABEL } from "@/lib/siya-os/config";
import { displayDepartment, type Department } from "@/lib/siya-os/departments";
import { BRAND } from "@/lib/brand";
import { notifyOwnerForGap } from "@/lib/siya-os/knowledge-gap";
import { recordQuestion, recordTimeToAnswer, recordAnswerFeedback } from "@/lib/siya-os/metrics";
import { SaveToMemoryPrompt } from "@/components/memory/SaveToMemoryPrompt";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { createAdhocTask } from "@/lib/tasks-api";
import {
  portalAskInput,
  portalAskSendBtn,
  portalBtnNavySm,
  portalStatusInfoBox,
  portalStatusInfoText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

type ChatLink = { label: string; href: string };
type RoutingMeta = {
  department: string;
  task: string;
  confidence: string;
  followUpQuestions?: string[];
};
type SourceMeta = { title: string; id: string };
type PendingTask = {
  title: string;
  assigneeId: string;
  assigneeLabel: string;
  priority: string;
  dueDate: string;
};
type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  links?: ChatLink[];
  routing?: RoutingMeta | null;
  sources?: SourceMeta[];
  escalationPreview?: string | null;
  knowledgeGap?: boolean;
  userQuestion?: string;
  gapNotified?: boolean;
  gapEmailSent?: boolean;
  gapEmailNote?: string;
  feedbackSent?: boolean;
  memoryOffer?: boolean;
  memorySaved?: boolean;
  pendingTask?: PendingTask | null;
  taskApproved?: boolean;
  executiveMeta?: {
    confidence: string;
    freshnessSeconds: number;
    recommendedAction: string;
    evidenceCount: number;
  } | null;
};

function mdLite(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i}>{chunk.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

function RoutingBadge({ routing }: { routing: RoutingMeta }) {
  return (
    <p className="mb-2 text-[11px] font-medium text-[var(--siya-text-muted)]">
      <span className="text-[var(--siya-primary)]">{displayDepartment(routing.department as Department)}</span>
      <span className="mx-1.5 text-[var(--siya-border)]">·</span>
      {routing.task}
    </p>
  );
}

export function SiyaChat({
  initialQuery,
  focusMode = false,
  variant = "default",
  firstName,
  persistKey,
  threadId,
  onThreadMetaChange,
  onRequestNewThread,
  surface = "default",
  openingOverride,
}: {
  initialQuery?: string;
  focusMode?: boolean;
  /** home = continuous My day Assist (greeting when empty, same engine as former Ask) */
  variant?: "default" | "home";
  firstName?: string;
  /** @deprecated sessionStorage key — Assist v2 uses threadId (server) instead. */
  persistKey?: string;
  /** Assist v2 server thread id (ath-…). */
  threadId?: string | null;
  /** Called after a turn is saved so the sidebar can refresh titles. */
  onThreadMetaChange?: () => void;
  /** Assist v2: Clear chat → start a new server thread. */
  onRequestNewThread?: () => void;
  /** founder-coach = Talk thread: same engine, no Plan Record writes, no 1–5 triage. */
  surface?: "default" | "founder-coach";
  openingOverride?: string;
}) {
  const { user, token } = useAuth();
  const adminCoPilot = isPortalAdmin(user?.role);
  const founderCoach = surface === "founder-coach";
  const homeVariant = variant === "home";
  const storageKey =
    threadId
      ? null
      : (persistKey ?? (homeVariant ? `siya-assist-thread-v3:${user?.id ?? "anon"}` : null));
  const opening = openingOverride
    ? openingOverride
    : focusMode
      ? "You're in Focus mode. I'll keep answers concise — steps and links first."
      : adminCoPilot
        ? SIYA_ADMIN_OPENING
        : SIYA_OPENING;
  const quickPrompts = founderCoach
    ? [
        "What's flagged in Clinical this week?",
        "Any decisions I should remember?",
        "What's in the SOP review queue?",
        "What should I know from lead check-ins?",
      ]
    : adminCoPilot
      ? [...ADMIN_CHAT_QUICK_PROMPTS, ...SIYA_QUICK_PROMPTS.slice(0, 2)]
      : SIYA_QUICK_PROMPTS;
  const sectionLabel = founderCoach
    ? "Try asking:"
    : adminCoPilot
      ? "What I can help with:"
      : CHAT_SECTION_LABEL;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (threadId) return [];
    if (typeof window !== "undefined" && storageKey) {
      try {
        sessionStorage.removeItem(`siya-assist-thread:${user?.id ?? "anon"}`);
        sessionStorage.removeItem(`siya-assist-thread-v2:${user?.id ?? "anon"}`);
        sessionStorage.removeItem(`siya-assist-thread:admin:${user?.id ?? "anon"}`);
        const raw = sessionStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length) return parsed;
        }
      } catch {
        /* ignore */
      }
    }
    return homeVariant ? [] : [{ id: "open", role: "assistant", content: opening }];
  });
  const [threadLoading, setThreadLoading] = useState(Boolean(threadId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const hour = new Date().getHours();
  const timeHello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const homeGreeting = `${timeHello}${firstName ? `, ${firstName}` : ""} — what's on your mind?`;

  useEffect(() => {
    if (!threadId || !token) {
      setThreadLoading(false);
      return;
    }
    let cancelled = false;
    setThreadLoading(true);
    sentInitial.current = false;
    (async () => {
      try {
        const { loadAssistThread } = await import("@/lib/assist-chat-api");
        const { messages: rows } = await loadAssistThread(threadId);
        if (cancelled) return;
        setMessages(
          rows.map((r) => ({
            id: r.id,
            role: r.role,
            content: r.content,
          })),
        );
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId, token]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      if (messages.length === 0) sessionStorage.removeItem(storageKey);
      else sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* private mode */
    }
  }, [messages, storageKey]);

  const historyPayload = useCallback(
    () =>
      messages
        .filter((m) => m.id !== "open")
        .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || threadLoading) return;
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      const t0 = Date.now();
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: trimmed,
            history: historyPayload(),
            focusMode,
            threadId: threadId || undefined,
            surface: founderCoach ? "founder-coach" : "default",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        recordTimeToAnswer(Date.now() - t0);
        recordQuestion({
          answered: !data.knowledgeGap,
          escalated: false,
          knowledgeGap: !!data.knowledgeGap,
        });
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.message,
            links: data.links,
            routing: data.routing,
            sources: data.sources,
            escalationPreview: data.escalationPreview,
            knowledgeGap: data.knowledgeGap,
            userQuestion: trimmed,
            pendingTask: data.pendingTask ?? null,
            executiveMeta: data.executiveMeta ?? null,
          },
        ]);
        onThreadMetaChange?.();
      } catch {
        setMessages((m) => [
          ...m,
          { id: `e-${Date.now()}`, role: "assistant", content: "Sorry — try again in a moment." },
        ]);
      } finally {
        setLoading(false);
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }
    },
    [loading, threadLoading, historyPayload, focusMode, token, threadId, onThreadMetaChange, founderCoach]
  );

  useEffect(() => {
    if (!initialQuery || sentInitial.current || threadLoading) return;
    sentInitial.current = true;
    void send(initialQuery);
  }, [initialQuery, send, threadLoading]);

  const notifyOwner = useCallback(async (msg: ChatMessage) => {
    if (!msg.userQuestion) return;
    const department = msg.routing?.department ?? "General";
    const task = msg.routing?.task ?? "Missing approved policy";
    let emailSent = false;
    let emailNote = "";
    let phiRedacted = false;
    let routeMode: "lead_digest" | "founder_instant" | undefined;
    let recordId: string | undefined;
    try {
      const res = await fetch("/api/knowledge-gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: msg.userQuestion,
          department,
          task,
        }),
      });
      const data = (await res.json()) as {
        emailSent?: boolean;
        message?: string;
        phiRedacted?: boolean;
        routeMode?: "lead_digest" | "founder_instant";
        record?: { id?: string };
      };
      emailSent = Boolean(data.emailSent);
      emailNote = typeof data.message === "string" ? data.message : "";
      phiRedacted = Boolean(data.phiRedacted);
      routeMode = data.routeMode;
      recordId = data.record?.id;
    } catch {
      emailNote = "Could not reach server — try Copy escalation summary instead.";
    }
    notifyOwnerForGap({
      question: msg.userQuestion,
      department,
      task,
      phiRedacted,
      routeMode,
      id: recordId,
    });
    setMessages((m) =>
      m.map((x) =>
        x.id === msg.id ? { ...x, gapNotified: true, gapEmailSent: emailSent, gapEmailNote: emailNote } : x,
      ),
    );
  }, [token]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fallback below */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  const copyEscalation = useCallback(async (msgId: string, preview: string) => {
    const ok = await copyText(preview);
    if (ok) {
      setCopiedId(msgId);
      window.setTimeout(() => setCopiedId((id) => (id === msgId ? null : id)), 2500);
    }
  }, []);

  const sendFeedback = useCallback(
    async (msgId: string, helpful: boolean, msg: ChatMessage, failureType?: string) => {
      recordAnswerFeedback({
        helpful,
        failureType,
        department: msg.routing?.department,
        knowledgeGap: msg.knowledgeGap,
      });
      try {
        await fetch("/api/assist-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            helpful,
            failureType,
            department: msg.routing?.department,
            knowledgeGap: msg.knowledgeGap,
          }),
        });
      } catch {
        /* local metrics still recorded */
      }
      // Thumbs only logs helpful / not-helpful. Memory save is a separate deliberate action.
      setMessages((m) =>
        m.map((x) => (x.id === msgId ? { ...x, feedbackSent: true, memoryOffer: false } : x)),
      );
    },
    [],
  );

  function userQuestionBefore(assistantMsgId: string): string {
    const idx = messages.findIndex((m) => m.id === assistantMsgId);
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content.trim().slice(0, 200);
    }
    return "Resolved Ask thread";
  }

  const approvePendingTask = useCallback(async (msgId: string, pending: PendingTask) => {
    try {
      await createAdhocTask({
        title: pending.title,
        assigneeId: pending.assigneeId,
        priority: pending.priority,
        dueDate: pending.dueDate,
      });
      setMessages((m) =>
        m.map((x) =>
          x.id === msgId
            ? {
                ...x,
                taskApproved: true,
                content: `${x.content}\n\n**Approved** — task created for ${pending.assigneeLabel}.`,
                pendingTask: null,
              }
            : x,
        ),
      );
    } catch {
      setMessages((m) =>
        m.map((x) =>
          x.id === msgId ? { ...x, content: `${x.content}\n\n(Could not create task — use Admin → Task board.)` } : x,
        ),
      );
    }
  }, []);

  function clearConversation() {
    if (threadId && onRequestNewThread) {
      onRequestNewThread();
      return;
    }
    setMessages([]);
    setInput("");
    sentInitial.current = true; // don't re-fire URL q after clear
    if (storageKey) {
      try {
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(`siya-assist-thread:${user?.id ?? "anon"}`);
        sessionStorage.removeItem(`siya-assist-thread-v2:${user?.id ?? "anon"}`);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className={`flex h-full min-h-0 flex-col ${homeVariant ? "" : "bg-[var(--siya-white)]/50"}`}>
      {threadLoading ? (
        <p className="px-1 py-3 text-sm text-[var(--siya-text-muted)]">Loading conversation…</p>
      ) : null}
      {!threadLoading && messages.length > 0 ? (
        <div className="mx-auto flex w-full max-w-2xl shrink-0 items-center justify-between gap-2 px-1 pb-2">
          <p className="text-[11px] text-[var(--siya-text-muted)]">Assist</p>
          <button
            type="button"
            onClick={clearConversation}
            className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--siya-text-secondary)] hover:border-[var(--siya-accent)] hover:text-[var(--siya-accent)]"
          >
            Clear chat
          </button>
        </div>
      ) : null}
      <div ref={listRef} className={`flex-1 overflow-y-auto ${homeVariant ? "px-1 py-2" : "px-4 py-6 md:px-8"}`}>
        <div className={`mx-auto max-w-2xl ${homeVariant ? "flex min-h-[min(48vh,420px)] flex-col" : "space-y-4"}`}>
          {homeVariant && !threadLoading && messages.length === 0 && !loading ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              <p className="font-[family-name:var(--font-poppins)] text-xl font-medium text-[var(--siya-primary)] md:text-2xl">
                {homeGreeting}
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--siya-text-muted)]">
                Ask about policies, SOPs, tools, or who to contact.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-[var(--siya-shadow)] ${
                  msg.role === "user"
                    ? "bg-[var(--siya-btn-primary)] text-white"
                    : "border border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-text-secondary)]"
                }`}
              >
                {msg.routing && msg.routing.department !== "General" ? (
                  <RoutingBadge routing={msg.routing} />
                ) : null}
                {msg.role === "assistant" ? mdLite(msg.content) : msg.content}
                {msg.links?.length ? (
                  <ul className="mt-2 space-y-1 border-t border-[var(--siya-border)] pt-2">
                    {msg.links.map((l) => (
                      <li key={l.href}>
                        <PortalNavLink href={l.href} className="font-medium text-[var(--siya-accent)] underline underline-offset-2">
                          {l.label}
                        </PortalNavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {msg.pendingTask && !msg.taskApproved ? (
                  <div className={`mt-3 ${portalStatusInfoBox} p-3`}>
                    <p className={`text-xs font-semibold ${portalStatusInfoText}`}>Approve creates a task only — no email.</p>
                    <button
                      type="button"
                      onClick={() => void approvePendingTask(msg.id, msg.pendingTask!)}
                      className={`mt-2 ${portalBtnNavySm}`}
                    >
                      Approve
                    </button>
                  </div>
                ) : null}
                {msg.executiveMeta ? (
                  <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                    Confidence: {msg.executiveMeta.confidence} · {msg.executiveMeta.recommendedAction}
                  </p>
                ) : null}
                {msg.knowledgeGap ? (
                  <div className={`mt-3 ${portalStatusWarnBox} p-3 text-xs`}>
                    <p className={`font-semibold ${portalStatusWarnText}`}>No approved guide yet</p>
                    <p className="mt-1 text-[var(--siya-text-secondary)]">
                      Suggested department: <strong>{msg.routing?.department ?? "General"}</strong>
                    </p>
                    {msg.gapNotified ? (
                      <p className="mt-2 font-medium text-[var(--siya-primary)]">
                        {msg.gapEmailNote ||
                          (msg.gapEmailSent
                            ? "Logged — reviewers notified"
                            : "Logged for the department lead’s weekly digest (or founder inbox if no lead).")}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void notifyOwner(msg)}
                        className={`mt-2 ${portalBtnNavySm}`}
                      >
                        Notify owner
                      </button>
                    )}
                  </div>
                ) : null}
                {msg.escalationPreview ? (
                  <button
                    type="button"
                    onClick={() => void copyEscalation(msg.id, msg.escalationPreview!)}
                    className="mt-3 w-full rounded-lg border border-[var(--siya-primary)]/20 bg-[var(--siya-bg-subtle)] px-3 py-2 text-left text-xs font-semibold text-[var(--siya-primary)] hover:bg-[var(--siya-bg-page)]"
                  >
                    {copiedId === msg.id ? "Copied — paste into Slack or email" : "Copy escalation summary for Slack / email"}
                  </button>
                ) : null}
                {msg.role === "assistant" && msg.id !== "open" && !msg.feedbackSent ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--siya-border)] pt-2">
                    <span className="text-[10px] text-[var(--siya-text-muted)]">Helpful? (yes/no log only)</span>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--siya-border)] px-2 py-0.5 text-xs hover:bg-[var(--siya-bg-subtle)]"
                      onClick={() => void sendFeedback(msg.id, true, msg)}
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--siya-border)] px-2 py-0.5 text-xs hover:bg-[var(--siya-bg-subtle)]"
                      onClick={() => void sendFeedback(msg.id, false, msg, "poor_explanation")}
                    >
                      👎
                    </button>
                  </div>
                ) : null}
                {msg.feedbackSent ? (
                  <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                    Thanks — logged (yes/no only, no transcript). Does not email anyone or change policy.
                  </p>
                ) : null}
                {isPortalMemoryEnabled() && msg.memoryOffer && !msg.memorySaved ? (
                  <SaveToMemoryPrompt
                    defaultTitle={userQuestionBefore(msg.id)}
                    defaultBody={msg.content.slice(0, 3500)}
                    source="ask_resolved"
                    onDone={() =>
                      setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, memorySaved: true } : x)))
                    }
                    onSkip={() =>
                      setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, memoryOffer: false } : x)))
                    }
                  />
                ) : null}
                {isPortalMemoryEnabled() && msg.memorySaved ? (
                  <p className="mt-2 text-[10px] font-semibold text-[var(--siya-accent)]">Saved to company memory.</p>
                ) : null}
              </div>
            </div>
              ))}
              {loading ? (
                <p className="text-sm text-[var(--siya-text-muted)]">
                  {adminCoPilot ? "Checking live tasks & guides…" : "Finding approved answers…"}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div
        className={
          homeVariant
            ? "sticky bottom-0 border-t border-[var(--siya-border)]/60 bg-[var(--siya-bg-page)]/95 pt-3 backdrop-blur"
            : "border-t border-[var(--siya-border)] bg-[var(--siya-white)] p-4 md:px-8"
        }
      >
        <div className={`mx-auto max-w-2xl ${homeVariant ? "px-0 pb-1" : ""}`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-[var(--siya-text-muted)]">{sectionLabel}</p>
          </div>
          <div className={`mb-3 flex flex-wrap gap-2 ${homeVariant ? "justify-start px-0.5" : "justify-center"}`}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void send(p)}
                className="rounded-full border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-1.5 text-xs text-[var(--siya-text-secondary)] transition hover:border-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                adminCoPilot
                  ? "Plan my day, assign a task, or ask policy…"
                  : "Ask about policies, SOPs, tools, or who to contact…"
              }
              className={
                homeVariant
                  ? "min-w-0 flex-1 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3 text-sm outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20"
                  : portalAskInput
              }
              autoFocus={homeVariant}
            />
            <VoiceInputButton value={input} onChange={setInput} disabled={loading} size="md" />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={portalAskSendBtn}
            >
              Send
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-[var(--siya-text-muted)]">
            {BRAND.chatSafetyLine}
          </p>
        </div>
      </div>
    </div>
  );
}
