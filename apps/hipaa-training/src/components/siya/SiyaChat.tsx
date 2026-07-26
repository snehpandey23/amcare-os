"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { SIYA_OPENING, SIYA_QUICK_PROMPTS } from "@/lib/siya-os/config";

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
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                }`}
              >
                {msg.role === "assistant" ? mdLite(msg.content) : msg.content}
                {msg.links?.length ? (
                  <ul className="mt-2 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    {msg.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-teal-600 underline dark:text-teal-400">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? <p className="text-sm text-zinc-400">Siya is thinking…</p> : null}
        </div>
      </div>
      <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {SIYA_QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void send(p)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-teal-50 dark:border-zinc-700 dark:text-zinc-400"
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
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
