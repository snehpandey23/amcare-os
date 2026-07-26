"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS } from "@/lib/siya-os/config";
import { BRAND } from "@/lib/brand";

type ChatLink = { label: string; href: string };
type ChatMessage = { id: string; role: "assistant" | "user"; content: string; links?: ChatLink[] };

function mdLite(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i}>{chunk.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

export function SiyaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "open", role: "assistant", content: SIYA_OPENING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.message,
            links: data.links,
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
    [loading]
  );

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
                {msg.role === "assistant" ? mdLite(msg.content) : msg.content}
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
              </div>
            </div>
          ))}
          {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Siya is thinking…</p> : null}
        </div>
      </div>
      <div className="border-t border-[var(--siya-border)] bg-white p-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-2">
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
              placeholder="Ask about HIPAA, billing, escalation…"
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
            {BRAND.internalBadge} ·{" "}
            <Link href="/training" className="text-[var(--siya-accent)] underline">
              Certification course
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
