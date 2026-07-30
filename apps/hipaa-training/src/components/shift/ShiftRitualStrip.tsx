"use client";

import { useEffect, useState } from "react";
import type { ShiftRitualKind } from "@/lib/shift-presence";
import { RITUAL_COPY } from "@/lib/shift-presence";

export function ShiftRitualStrip({
  ritual,
  onDismiss,
}: {
  ritual: ShiftRitualKind;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ritual) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 8000);
    return () => window.clearTimeout(t);
  }, [ritual, onDismiss]);

  if (!ritual || !visible) return null;
  const copy = RITUAL_COPY[ritual];

  return (
    <div
      className="no-print shrink-0 border-b border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-4 py-2 text-center text-sm text-[var(--siya-text-secondary)] md:px-6"
      role="status"
    >
      <span className="font-semibold text-[var(--siya-primary)]">{copy.title}</span>
      <span className="mx-2 opacity-40">·</span>
      <span>{copy.body}</span>
      <button type="button" onClick={onDismiss} className="ml-3 text-xs text-[var(--siya-accent)] underline">
        Dismiss
      </button>
    </div>
  );
}
