"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS } from "@/lib/siya-os/config";

type ChatLink = { label: string; href: string };

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  links?: ChatLink[];
};

function renderMarkdownLite(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
        {chunk.slice(2, -2)}
      </strong>
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

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.message as string,
          links: data.links as ChatLink[] | undefined,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "Sorry — I couldn't reach the assistant. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
    }
  }, [loading]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                }`}
              >
                {msg.role === "assistant" ? renderMarkdownLite(msg.content) : msg.content}
                {msg.links?.length ? (
                  <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    {msg.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} className="text-teal-600 underline underline-offset-2 dark:text-teal-400">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? (
            <p className="text-sm text-zinc-400">Siya is thinking…</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {SIYA_QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void send(p)}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 hover:border-teal-300 hover:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-teal-800"
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
              type="text"
              value={input}
              placeholder="Ask about HIPAA, billing workflow, escalation…"
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-zinc-400">
            Internal use only · Not for patient PHI ·{" "}
            <Link href="/training" className="text-teal-600 underline dark:text-teal-400">
              HIPAA certification course
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
