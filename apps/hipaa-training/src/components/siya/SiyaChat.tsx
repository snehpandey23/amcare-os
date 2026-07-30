"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS, SIYA_ADMIN_OPENING, ADMIN_CHAT_QUICK_PROMPTS, CHAT_SECTION_LABEL } from "@/lib/siya-os/config";
import { displayDepartment, type Department } from "@/lib/siya-os/departments";
import { BRAND } from "@/lib/brand";
import { notifyOwnerForGap } from "@/lib/siya-os/knowledge-gap";
import { recordQuestion, recordTimeToAnswer, recordAnswerFeedback } from "@/lib/siya-os/metrics";
import { SaveToMemoryPrompt } from "@/components/memory/SaveToMemoryPrompt";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { createAdhocTask } from "@/lib/tasks-api";

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

export function SiyaChat({ initialQuery, focusMode = false }: { initialQuery?: string; focusMode?: boolean }) {
  const { user, token } = useAuth();
  const adminCoPilot = isPortalAdmin(user?.role);
  const opening = focusMode
    ? "You're in Focus mode. I'll keep answers concise — steps and links first."
    : adminCoPilot
      ? SIYA_ADMIN_OPENING
      : SIYA_OPENING;
  const quickPrompts = adminCoPilot ? [...ADMIN_CHAT_QUICK_PROMPTS, ...SIYA_QUICK_PROMPTS.slice(0, 2)] : SIYA_QUICK_PROMPTS;
  const sectionLabel = adminCoPilot ? "Executive Ask:" : CHAT_SECTION_LABEL;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "open", role: "assistant", content: opening },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

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
      if (!trimmed || loading) return;
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
          body: JSON.stringify({ message: trimmed, history: historyPayload(), focusMode }),
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
    [loading, historyPayload, focusMode, token]
  );

  useEffect(() => {
    if (!initialQuery || sentInitial.current) return;
    sentInitial.current = true;
    void send(initialQuery);
  }, [initialQuery, send]);

  const notifyOwner = useCallback(async (msg: ChatMessage) => {
    if (!msg.userQuestion) return;
    const department = msg.routing?.department ?? "General";
    const task = msg.routing?.task ?? "Missing approved policy";
    let emailSent = false;
    let emailNote = "";
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
      const data = (await res.json()) as { emailSent?: boolean; message?: string };
      emailSent = Boolean(data.emailSent);
      emailNote = typeof data.message === "string" ? data.message : "";
    } catch {
      emailNote = "Could not reach server — try Copy escalation summary instead.";
    }
    notifyOwnerForGap({
      question: msg.userQuestion,
      department,
      task,
    });
    setMessages((m) =>
      m.map((x) =>
        x.id === msg.id ? { ...x, gapNotified: true, gapEmailSent: emailSent, gapEmailNote: emailNote } : x,
      ),
    );
  }, []);

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
      setMessages((m) =>
        m.map((x) =>
          x.id === msgId
            ? {
                ...x,
                feedbackSent: true,
                memoryOffer:
                  helpful && !msg.knowledgeGap && msg.content.trim().length > 60 && msg.role === "assistant",
              }
            : x,
        ),
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

  return (
    <div className="flex h-full min-h-0 flex-col bg-white/50">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-[var(--siya-shadow)] ${
                  msg.role === "user"
                    ? "bg-[var(--siya-primary)] text-white"
                    : "border border-[var(--siya-border)] bg-white text-[var(--siya-text-secondary)]"
                }`}
              >
                {msg.routing ? <RoutingBadge routing={msg.routing} /> : null}
                {msg.role === "assistant" ? mdLite(msg.content) : msg.content}
                {msg.sources?.length ? (
                  <p className="mt-2 border-t border-[var(--siya-border)] pt-2 text-[11px] text-[var(--siya-text-muted)]">
                    Based on: {msg.sources.map((s) => s.title).join(" · ")}
                  </p>
                ) : null}
                {msg.links?.length ? (
                  <ul className="mt-2 space-y-1 border-t border-[var(--siya-border)] pt-2">
                    {msg.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="font-medium text-[var(--siya-accent)] underline underline-offset-2">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {msg.pendingTask && !msg.taskApproved ? (
                  <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/80 p-3">
                    <p className="text-xs font-semibold text-violet-950">Approve creates a task only — no email.</p>
                    <button
                      type="button"
                      onClick={() => void approvePendingTask(msg.id, msg.pendingTask!)}
                      className="mt-2 rounded-lg bg-[var(--siya-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--siya-primary-hover)]"
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
                  <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs">
                    <p className="font-semibold text-amber-950">No approved guide yet</p>
                    <p className="mt-1 text-[var(--siya-text-secondary)]">
                      Suggested department: <strong>{msg.routing?.department ?? "General"}</strong>
                    </p>
                    {msg.gapNotified ? (
                      <p className="mt-2 font-medium text-[var(--siya-primary)]">
                        {msg.gapEmailSent
                          ? "Sent to bot@siya.health — awaiting policy"
                          : msg.gapEmailNote || "Logged on this device — email may need RESEND_API_KEY on Vercel"}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void notifyOwner(msg)}
                        className="mt-2 rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--siya-primary-hover)]"
                      >
                        Notify owner (email bot@siya.health)
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
                    <span className="text-[10px] text-[var(--siya-text-muted)]">Helpful?</span>
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
                  <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">Thanks — logged for review (no PHI).</p>
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
      </div>
      <div className="border-t border-[var(--siya-border)] bg-white p-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-center text-xs font-medium text-[var(--siya-text-muted)]">
            {sectionLabel}
          </p>
          <div className="mb-3 flex flex-wrap gap-2 justify-center">
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
              placeholder={adminCoPilot ? "Plan my day, assign a task, or ask policy…" : "Describe your task…"}
              className="min-w-0 flex-1 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-2.5 text-sm outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[var(--siya-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-accent-hover)] disabled:opacity-50"
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
