"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS } from "@/lib/siya-os/config";
import { displayDepartment, type Department } from "@/lib/siya-os/departments";
import { BRAND } from "@/lib/brand";
import { notifyOwnerForGap } from "@/lib/siya-os/knowledge-gap";
import { recordQuestion, recordTimeToAnswer } from "@/lib/siya-os/metrics";

type ChatLink = { label: string; href: string };
type RoutingMeta = {
  department: string;
  task: string;
  confidence: string;
  followUpQuestions?: string[];
};
type SourceMeta = { title: string; id: string };
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

export function SiyaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "open", role: "assistant", content: SIYA_OPENING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

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
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: historyPayload() }),
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
    [loading, historyPayload]
  );

  const notifyOwner = useCallback(async (msg: ChatMessage) => {
    if (!msg.userQuestion || !msg.routing) return;
    await fetch("/api/knowledge-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: msg.userQuestion,
        department: msg.routing.department,
        task: msg.routing.task,
      }),
    });
    notifyOwnerForGap({
      question: msg.userQuestion,
      department: msg.routing.department,
      task: msg.routing.task,
    });
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, gapNotified: true } : x)));
  }, []);

  const copyEscalation = useCallback(async (preview: string) => {
    try {
      await navigator.clipboard.writeText(preview);
    } catch {
      /* ignore */
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
                    Sources: {msg.sources.map((s) => s.title).join(" · ")}
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
                {msg.knowledgeGap ? (
                  <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs">
                    <p className="font-semibold text-amber-950">Unknown workflow</p>
                    <p className="mt-1 text-[var(--siya-text-secondary)]">
                      Suggested department: <strong>{msg.routing?.department ?? "General"}</strong>
                    </p>
                    {msg.gapNotified ? (
                      <p className="mt-2 font-medium text-[var(--siya-primary)]">
                        Question saved · Status: awaiting policy
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void notifyOwner(msg)}
                        className="mt-2 rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--siya-primary-hover)]"
                      >
                        Notify owner
                      </button>
                    )}
                  </div>
                ) : null}
                {msg.escalationPreview ? (
                  <button
                    type="button"
                    onClick={() => void copyEscalation(msg.escalationPreview!)}
                    className="mt-3 w-full rounded-lg border border-[var(--siya-primary)]/20 bg-[var(--siya-bg-subtle)] px-3 py-2 text-left text-xs font-semibold text-[var(--siya-primary)] hover:bg-[var(--siya-bg-page)]"
                  >
                    Copy escalation summary for Slack / email
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Finding approved answers…</p> : null}
        </div>
      </div>
      <div className="border-t border-[var(--siya-border)] bg-white p-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-center font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--siya-primary)]">
            What do you need help with today?
          </p>
          <div className="mb-3 flex flex-wrap gap-2 justify-center">
            {SIYA_QUICK_PROMPTS.map((p) => (
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
              placeholder="Describe your task…"
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
          <p className="mt-2 text-center text-xs text-[var(--siya-text-muted)]">
            {BRAND.internalBadge} · {BRAND.privacyFootnote}
          </p>
        </div>
      </div>
    </div>
  );
}
