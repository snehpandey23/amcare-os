"use client";

import { useState } from "react";
import { saveMemory, IMPORTANCE_HINT, IMPORTANCE_LABEL, type MemoryImportance } from "@/lib/memory-api";
import { loadLocalPortalProfile } from "@/lib/portal-profile";

export function SaveToMemoryPrompt({
  defaultTitle,
  defaultBody,
  source = "ask_resolved",
  onDone,
  onSkip,
}: {
  defaultTitle: string;
  defaultBody: string;
  source?: "ask_resolved" | "manual" | "decision";
  onDone: () => void;
  onSkip: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle.slice(0, 200));
  const [body, setBody] = useState(defaultBody.slice(0, 4000));
  const [importance, setImportance] = useState<MemoryImportance>(2);
  const [pending, setPending] = useState(false);
  const profile = loadLocalPortalProfile();

  async function submit() {
    setPending(true);
    try {
      await saveMemory({
        title: title.trim(),
        body: body.trim(),
        importance,
        source,
        department: profile.department,
        visibility: "org",
      });
      onDone();
    } catch {
      alert("Could not save memory. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--siya-accent)]/30 bg-[var(--siya-bg-subtle)] p-3 text-xs">
      <p className="font-semibold text-[var(--siya-primary)]">Worth remembering for the company?</p>
      <p className="mt-1 text-[var(--siya-text-muted)]">Most answers: no. Good fixes and decisions: yes — you taught Siya.</p>
      <label className="mt-2 block">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
        />
      </label>
      <label className="mt-2 block">
        Summary
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
      </label>
      <p className="mt-2 font-medium text-[var(--siya-text-secondary)]">Importance</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {([1, 2, 3] as MemoryImportance[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setImportance(level)}
            className={`rounded-full border px-2 py-1 ${importance === level ? "border-[var(--siya-primary)] bg-white font-semibold" : ""}`}
            title={IMPORTANCE_HINT[level]}
          >
            L{level} {IMPORTANCE_LABEL[level]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending || !title.trim() || !body.trim()}
          onClick={() => void submit()}
          className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 font-semibold text-white"
        >
          {pending ? "Saving…" : "Save to memory"}
        </button>
        <button type="button" onClick={onSkip} className="rounded-lg border px-3 py-1.5">
          Not this time
        </button>
      </div>
    </div>
  );
}
