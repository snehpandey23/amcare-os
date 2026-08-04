"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchTeamPulse, type TeamPulse, type TeamPulseMember } from "@/lib/team-pulse-api";
import type { PresenceStatus } from "@/lib/shift-api";
import { PRESENCE_EMOJI } from "@/lib/shift-presence";
import {
  portalBtnGhostSm,
  portalH3,
  portalSectionCompact,
  portalStatusErrorText,
  portalStatusInfoPill,
  portalStatusSuccessBox,
  portalStatusSuccessText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

function displayName(m: TeamPulseMember): string {
  return m.name?.trim() || m.email.split("@")[0] || m.email;
}

function presenceLabel(m: TeamPulseMember): string {
  if (!m.onShift) return "Off shift";
  if (m.presence === "break") return "Break";
  if (m.presence === "focus") return "Focus";
  return "Working";
}

type TeamPulsePanelProps = {
  compact?: boolean;
  className?: string;
};

export function TeamPulsePanel({ compact = false, className = "" }: TeamPulsePanelProps) {
  const { user, authReady } = useAuth();
  const [pulse, setPulse] = useState<TeamPulse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const load = useCallback(async (quiet?: boolean) => {
    if (!quiet) setError(null);
    try {
      const data = await fetchTeamPulse();
      setPulse(data);
      setUpdatedAt(Date.now());
    } catch (e) {
      if (!quiet) setError(e instanceof Error ? e.message : "Could not load team board");
    }
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    void load();
    const id = window.setInterval(() => void load(true), 45_000);
    return () => window.clearInterval(id);
  }, [authReady, user, load]);

  if (!authReady || !user) return null;

  return (
    <section className={`${portalSectionCompact} ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className={portalH3}>Team today</h2>
          <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
            Who is on shift and what is assigned for the ops day{pulse ? ` (${pulse.timezone}, ${pulse.date})` : ""}.
            Refreshes every 45s.
          </p>
          {updatedAt ? (
            <p className="mt-0.5 text-[10px] text-[var(--siya-text-muted)]">
              Updated {new Date(updatedAt).toLocaleTimeString()}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!compact ? (
            <button type="button" className={portalBtnGhostSm} onClick={() => void load()}>
              Refresh
            </button>
          ) : (
            <Link href="/team" className="text-xs font-semibold text-[var(--siya-accent)] hover:underline">
              Full team board →
            </Link>
          )}
          {user && isPortalAdmin(user.role) ? (
            <Link href="/admin/team" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
              Admin
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <p className={`mt-3 text-xs ${portalStatusErrorText}`}>{error}</p> : null}

      {pulse ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-lg px-2.5 py-1.5 ${portalStatusSuccessBox} ${portalStatusSuccessText}`}>
              🟢 Working: <strong>{pulse.live.working}</strong>
            </span>
            <span className={portalStatusInfoPill}>
              🎯 Focus: <strong>{pulse.live.inFocus}</strong>
            </span>
            <span className={`rounded-lg px-2.5 py-1.5 ${portalStatusWarnBox} ${portalStatusWarnText}`}>
              ☕ Break: <strong>{pulse.live.onBreak}</strong>
            </span>
            <span className="rounded-lg bg-[var(--siya-bg-subtle)] px-2.5 py-1.5 text-[var(--siya-text-secondary)]">
              ⚫ Off shift: <strong>{pulse.live.offShift}</strong>
            </span>
          </div>

          <div className={`mt-4 grid gap-4 ${compact ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                Who is where
              </h3>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">
                {(compact ? pulse.members.slice(0, 8) : pulse.members).map((m) => {
                  const p = m.presence as PresenceStatus | null;
                  return (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--siya-bg-subtle)]/80"
                    >
                      <span className="font-medium text-[var(--siya-text-secondary)]">
                        {displayName(m)}
                        {m.id === user.id ? (
                          <span className="ml-1 text-[10px] font-normal text-[var(--siya-text-muted)]">(you)</span>
                        ) : null}
                      </span>
                      <span className="text-xs text-[var(--siya-text-muted)]">
                        {m.onShift && p ? (
                          <>
                            {PRESENCE_EMOJI[p]} {presenceLabel(m)}
                          </>
                        ) : (
                          <>⚫ {presenceLabel(m)}</>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {compact && pulse.members.length > 8 ? (
                <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
                  +{pulse.members.length - 8} more on{" "}
                  <Link href="/team" className="font-semibold text-[var(--siya-accent)] hover:underline">
                    Team
                  </Link>
                </p>
              ) : null}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                Today&apos;s assignments
              </h3>
              <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-sm">
                {pulse.members
                  .filter((m) => m.openTasksToday > 0)
                  .map((m) => (
                    <li key={`tasks-${m.id}`} className="rounded-lg border border-[var(--siya-border)]/80 px-2.5 py-2">
                      <p className="font-medium text-[var(--siya-primary)]">
                        {displayName(m)}
                        <span className="ml-1 text-xs font-normal text-[var(--siya-text-muted)]">
                          · {m.openTasksToday} open
                        </span>
                      </p>
                      <ul className="mt-1 list-inside list-disc text-xs text-[var(--siya-text-secondary)]">
                        {m.taskTitles.map((t, i) => (
                          <li key={`${m.id}-${i}`} className="truncate">
                            {t}
                          </li>
                        ))}
                        {m.openTasksToday > m.taskTitles.length ? (
                          <li className="list-none text-[var(--siya-text-muted)]">
                            +{m.openTasksToday - m.taskTitles.length} more
                          </li>
                        ) : null}
                      </ul>
                    </li>
                  ))}
                {!pulse.members.some((m) => m.openTasksToday > 0) ? (
                  <li className="text-xs text-[var(--siya-text-muted)]">No open tasks on the board for today yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </>
      ) : !error ? (
        <p className="mt-3 text-xs text-[var(--siya-text-muted)]">Loading team board…</p>
      ) : null}
    </section>
  );
}
