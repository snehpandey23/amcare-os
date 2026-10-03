"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPrefKey,
  type NotificationPrefsResponse,
} from "@/lib/notification-prefs-api";

export function NotificationPreferencesPanel() {
  const [data, setData] = useState<NotificationPrefsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<NotificationPrefKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchNotificationPreferences();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load preferences");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onToggle(key: NotificationPrefKey, enabled: boolean) {
    setSavingKey(key);
    setError(null);
    setSavedFlash(null);
    try {
      const next = await updateNotificationPreferences({ [key]: enabled });
      setData(next);
      setSavedFlash("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Email notifications</h2>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">Loading…</p>
      </section>
    );
  }

  if (!data || data.applicable.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Email notifications</h2>
      <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
        Controls copies you receive as an admin or lead. Turning a toggle off never stops the staff
        member the event is about from getting their own email.
      </p>
      <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
        Note: HR mailbox notifications are managed separately (shared inbox, not a personal toggle).
      </p>

      <ul className="mt-4 space-y-4">
        {data.catalog.map((item) => {
          const on = data.prefs[item.key] !== false;
          const busy = savingKey === item.key;
          return (
            <li
              key={item.key}
              className="flex items-start justify-between gap-4 border-t border-[var(--siya-border)] pt-4 first:border-0 first:pt-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--siya-text)]">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--siya-text-muted)]">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                disabled={busy}
                onClick={() => void onToggle(item.key, !on)}
                className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors ${
                  on ? "bg-[var(--siya-accent)]" : "bg-[var(--siya-border)]"
                } ${busy ? "opacity-60" : ""}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    on ? "translate-x-5" : "translate-x-0"
                  }`}
                />
                <span className="sr-only">{on ? "On" : "Off"}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {data.locked.length ? (
        <p className="mt-4 text-xs text-[var(--siya-text-muted)]">
          {data.locked.map((l) => l.reason).join(" ")}
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {savedFlash ? <p className="mt-3 text-sm text-emerald-700">{savedFlash}</p> : null}
    </section>
  );
}
