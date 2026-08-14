"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import {
  fetchTeamRoster,
  inviteTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamRosterMember,
} from "@/lib/admin-api";
import { fetchTeamShiftTrends, fetchShiftDashboard, type ShiftDashboard, type PresenceStatus } from "@/lib/shift-api";
import { PRESENCE_EMOJI } from "@/lib/shift-presence";
import { MODULES } from "@/content/modules";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { getStoredToken } from "@/lib/authStorage";
import { buildInviteCopyText } from "@/lib/invite-email";
import { downloadShiftAttendanceCsv } from "@/lib/portal-analytics";
import { portalBtnGhostSm, portalH1, portalH2, portalSection } from "@/lib/portal-ui";
import { DepartmentLeadsSection } from "@/components/admin/DepartmentLeadsSection";

const LOGIN_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/login`
    : "https://siya-staff-assist.vercel.app/login";

function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function fmtMinutes(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function presenceLabel(p: PresenceStatus | null | undefined, onShift: boolean): string {
  if (!onShift) return "Off shift";
  if (p === "break") return "Break";
  if (p === "focus") return "Focus";
  return "Working";
}

function randomTempPassword(): string {
  const base = "Siya";
  const tail = Math.random().toString(36).slice(2, 8);
  return `${base}-${tail}!9`;
}

export function TeamAdminPanel() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [members, setMembers] = useState<TeamRosterMember[]>([]);
  const [shiftDashboard, setShiftDashboard] = useState<ShiftDashboard | null>(null);
  const [dashboardUpdatedAt, setDashboardUpdatedAt] = useState<number | null>(null);
  const [shiftTrends, setShiftTrends] = useState<Awaited<ReturnType<typeof fetchTeamShiftTrends>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePass, setInvitePass] = useState("");
  const [inviteRole, setInviteRole] = useState<"trainee" | "admin">("trainee");
  const [invitePending, setInvitePending] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [inviteCopyBlock, setInviteCopyBlock] = useState<string | null>(null);
  const [csvPending, setCsvPending] = useState(false);
  const invitePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inviteOpen) return;
    invitePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [inviteOpen]);

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) {
      setLoading(true);
      setError(null);
    }
    try {
      const [roster, dashboard, trends] = await Promise.all([
        fetchTeamRoster(),
        fetchShiftDashboard(),
        fetchTeamShiftTrends(),
      ]);
      setMembers(roster);
      setShiftDashboard(dashboard);
      setDashboardUpdatedAt(Date.now());
      setShiftTrends(trends);
    } catch (e) {
      if (!opts?.quiet) {
        setError(e instanceof Error ? e.message : "Could not load team");
      }
    } finally {
      if (!opts?.quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    void load();
  }, [authReady, user, router, load]);

  useEffect(() => {
    if (!authReady || !user || !isPortalAdmin(user.role)) return;
    const id = window.setInterval(() => {
      void load({ quiet: true });
    }, 45_000);
    return () => window.clearInterval(id);
  }, [authReady, user, load]);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    if (invitePass.length < 8) {
      setInviteResult("Temporary password must be at least 8 characters.");
      return;
    }
    setInvitePending(true);
    setInviteResult(null);
    setInviteCopyBlock(null);
    const email = inviteEmail.trim();
    const name = inviteName.trim();
    const pass = invitePass;
    try {
      await inviteTeamMember({
        email,
        name,
        password: pass,
        role: inviteRole,
      });

      const copyPayload = {
        toEmail: email,
        name,
        temporaryPassword: pass,
        loginUrl: LOGIN_URL,
      };
      setInviteCopyBlock(buildInviteCopyText(copyPayload));

      let emailNote = "";
      const token = getStoredToken();
      const res = await fetch("/api/admin/invite-email", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: email,
          name,
          temporaryPassword: pass,
          loginUrl: LOGIN_URL,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        emailSent?: boolean;
        emailError?: string;
      };
      if (data.emailSent) {
        emailNote = ` Invite email sent to ${email}.`;
      } else {
        emailNote = ` Email not sent${data.emailError ? `: ${data.emailError}` : "."} Copy the details below and share securely.`;
      }

      setInviteResult(`Account created for ${email}.${emailNote}`);
      setInviteEmail("");
      setInviteName("");
      setInvitePass("");
      await load();
    } catch (err) {
      setInviteResult(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInvitePending(false);
    }
  }

  async function copyInviteBlock() {
    if (!inviteCopyBlock) return;
    try {
      await navigator.clipboard.writeText(inviteCopyBlock);
      setInviteResult((prev) => (prev ? `${prev} (Copied to clipboard.)` : "Copied to clipboard."));
    } catch {
      alert("Could not copy — select the text and copy manually.");
    }
  }

  async function onRoleChange(member: TeamRosterMember, role: "admin" | "trainee") {
    if (member.portalRole === role) return;
    if (!confirm(`Change ${member.email} to ${role === "admin" ? "Admin" : "Staff"}?`)) return;
    try {
      await updateTeamMember(member.id, { role });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function onDeleteMember(member: TeamRosterMember) {
    const msg =
      `Permanently delete ${member.email}?\n\nThis removes their portal account, training progress, assigned tasks, and templates tied to them. This cannot be undone.`;
    if (!confirm(msg)) return;
    const typed = prompt(`Type ${member.email} to confirm deletion:`);
    if (typed?.trim().toLowerCase() !== member.email.toLowerCase()) {
      alert("Deletion cancelled — email did not match.");
      return;
    }
    try {
      await deleteTeamMember(member.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (!authReady || !user || !isPortalAdmin(user.role)) {
    return null;
  }

  const moduleTotal = MODULES.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={portalH1}>
            Team health
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--siya-text-muted)]">
            Coaching view — learning outcomes and voluntary practice, not surveillance. Invite colleagues and suggest
            interventions from what they complete, not idle time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/tasks" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
            Task board
          </Link>
          <Link href="/admin/sop-review" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
            SOP review
          </Link>
          <button
            type="button"
            className={trainingLinkPrimaryClass}
            onClick={() => {
              setInviteOpen(true);
              setInviteResult(null);
              setInviteCopyBlock(null);
              if (!invitePass) setInvitePass(randomTempPassword());
            }}
          >
            Invite team member
          </button>
        </div>
      </header>

      {inviteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-team-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !invitePending) setInviteOpen(false);
          }}
        >
          <div
            ref={invitePanelRef}
            className="w-full max-w-lg rounded-xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
          >
            <form onSubmit={onInvite}>
              <h2 id="invite-team-title" className="text-sm font-semibold text-[var(--siya-primary)]">
                Invite team member
              </h2>
              <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                Creates a portal account. Share login details securely — email only sends if Resend is configured on
                the staff app.
              </p>
              {inviteResult ? (
                <div className="mt-3 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-sm">
                  <p>{inviteResult}</p>
                  {inviteCopyBlock ? (
                    <div className="mt-2">
                      <pre className="max-h-40 overflow-auto rounded-md bg-white p-2 text-xs">{inviteCopyBlock}</pre>
                      <button
                        type="button"
                        className={`mt-2 ${trainingLinkPrimaryClass}`}
                        onClick={() => void copyInviteBlock()}
                      >
                        Copy invite text
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-[var(--siya-text-secondary)]">
                Login credentials are emailed to the teammate automatically. A copy block stays available if email fails.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
                  Work email
                  <TrainingInput
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1"
                  />
                </label>
                <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
                  Full name
                  <TrainingInput
                    required
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="mt-1"
                  />
                </label>
                <label className="block text-xs font-medium text-[var(--siya-text-muted)] sm:col-span-2">
                  Temporary password (8+ chars)
                  <div className="mt-1 flex gap-2">
                    <TrainingInput
                      required
                      type="text"
                      autoComplete="new-password"
                      value={invitePass}
                      onChange={(e) => setInvitePass(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--siya-bg-subtle)]"
                      onClick={() => setInvitePass(randomTempPassword())}
                    >
                      Generate
                    </button>
                  </div>
                </label>
                <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
                  Account type
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "trainee" | "admin")}
                    className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                  >
                    <option value="trainee">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!inviteCopyBlock ? (
                  <button type="submit" disabled={invitePending} className={trainingLinkPrimaryClass}>
                    {invitePending ? "Creating…" : "Create account"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={trainingLinkPrimaryClass}
                    onClick={() => {
                      setInviteOpen(false);
                      setInviteResult(null);
                      setInviteCopyBlock(null);
                    }}
                  >
                    Done
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg border border-[var(--siya-border)] px-4 py-2 text-sm"
                  disabled={invitePending}
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {shiftDashboard ? (
        <section className={portalSection}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className={portalH2}>Ops dashboard</h2>
              <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                Live presence + today&apos;s activity ({shiftDashboard.timezone}, {shiftDashboard.date}). Refreshes every
                45s.
              </p>
              {dashboardUpdatedAt ? (
                <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">
                  Updated {new Date(dashboardUpdatedAt).toLocaleTimeString()}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--siya-bg-subtle)]"
              onClick={() => void load()}
            >
              Refresh now
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
              🟢 Working: <strong>{shiftDashboard.live.working}</strong>
            </span>
            <span className="rounded-lg border border-[var(--siya-status-info-border)] bg-[var(--siya-status-info-bg)] px-3 py-2 text-[var(--siya-status-info-text)]">
              🎯 Focus: <strong>{shiftDashboard.live.inFocus}</strong>
            </span>
            <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950">
              ☕ Break: <strong>{shiftDashboard.live.onBreak}</strong>
            </span>
            <span className="rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2">
              ⚫ Off shift: <strong>{shiftDashboard.live.offShift}</strong>
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs">
              <p className="text-[var(--siya-text-muted)]">Started shift today</p>
              <p className="text-lg font-semibold text-[var(--siya-primary)]">
                {shiftDashboard.today.uniqueStarters}
                <span className="ml-1 text-xs font-normal text-[var(--siya-text-muted)]">
                  / {shiftDashboard.live.expected} staff
                </span>
              </p>
              <p className="text-[10px] text-[var(--siya-text-muted)]">
                {shiftDashboard.today.loginStarts} via login · {shiftDashboard.today.manualStarts} manual
              </p>
            </div>
            <div className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs">
              <p className="text-[var(--siya-text-muted)]">Ended shift</p>
              <p className="text-lg font-semibold">{shiftDashboard.today.shiftEnds}</p>
            </div>
            <div className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs">
              <p className="text-[var(--siya-text-muted)]">Break / focus sessions</p>
              <p className="text-lg font-semibold">
                {shiftDashboard.today.breakStarts} / {shiftDashboard.today.focusStarts}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs">
              <p className="text-[var(--siya-text-muted)]">Workplace link opens</p>
              <p className="text-lg font-semibold">{shiftDashboard.today.toolOpens}</p>
            </div>
          </div>

          {shiftDashboard.toolLinks.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase text-[var(--siya-text-muted)]">Top tools today</h3>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                {shiftDashboard.toolLinks.map((t) => (
                  <li key={t.label + t.host} className="rounded-full bg-[var(--siya-bg-subtle)] px-2.5 py-1">
                    {t.label}: <strong>{t.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {shiftDashboard.live.members.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--siya-border)] text-sm">
              {shiftDashboard.live.members.map((m) => {
                const p = (m.presence ?? "working") as PresenceStatus;
                return (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      {m.name || m.email}
                      <span className="ml-2 text-xs text-[var(--siya-text-muted)]">{m.email}</span>
                    </span>
                    <span className="text-xs text-[var(--siya-text-secondary)]">
                      {m.onShift ? (
                        <>
                          {PRESENCE_EMOJI[p]} <strong>{presenceLabel(p, true)}</strong>
                        </>
                      ) : (
                        <>⚫ {presenceLabel(null, false)}</>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <details className="mt-4 text-xs text-[var(--siya-text-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--siya-text-secondary)]">Audit export (CSV)</summary>
            <p className="mt-2">Raw event log for finance/compliance — same {shiftDashboard.timezone} day as above.</p>
            <button
              type="button"
              disabled={csvPending}
              className="mt-2 rounded-lg border border-[var(--siya-border)] px-3 py-1.5 font-medium hover:bg-[var(--siya-bg-subtle)] disabled:opacity-60"
              onClick={() => {
                setCsvPending(true);
                void downloadShiftAttendanceCsv(shiftDashboard.date)
                  .catch((e) => setError(e instanceof Error ? e.message : "CSV download failed"))
                  .finally(() => setCsvPending(false));
              }}
            >
              {csvPending ? "Preparing…" : `Download ${shiftDashboard.date} CSV`}
            </button>
          </details>
        </section>
      ) : null}

      {shiftTrends ? (
        <section className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/50 p-5">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Last {shiftTrends.periodDays} days (team)</h2>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Trends only — no per-person presence logs. {shiftTrends.note}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span>
              Started shifts: <strong>{shiftTrends.startedShifts}</strong>
            </span>
            <span>
              Completed shifts: <strong>{shiftTrends.completedShifts}</strong>
            </span>
            <span>
              Avg focus sessions / shift: <strong>{shiftTrends.avgFocusSessionsPerShift}</strong>
            </span>
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Loading roster…</p> : null}

      {!loading && members.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--siya-border)] bg-white shadow-[var(--siya-shadow)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] text-xs uppercase text-[var(--siya-text-muted)]">
              <tr>
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2">Manage</th>
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Last sign-in</th>
                <th className="px-3 py-2">HIPAA modules</th>
                <th className="px-3 py-2">Cert ready</th>
                <th className="px-3 py-2">Level Up</th>
                <th className="px-3 py-2">Chat practice</th>
                <th className="px-3 py-2">US culture</th>
                <th className="px-3 py-2">Billing drill</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-[var(--siya-border)] last:border-0">
                  <td className="px-3 py-3">
                    <div className="font-medium text-[var(--siya-text-secondary)]">{m.name || "—"}</div>
                    <div className="text-xs text-[var(--siya-text-muted)]">{m.email}</div>
                    <div className="text-[10px] text-[var(--siya-text-muted)]">
                      Training role: {m.training.workforceRole} · {fmtMinutes(m.training.secondsInCourse)} in course
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/admin/team/edit?userId=${encodeURIComponent(m.id)}`}
                        className="text-xs font-semibold text-[var(--siya-accent)] hover:underline"
                      >
                        Edit name / reset password
                      </Link>
                      {m.id !== user.id ? (
                        <button
                          type="button"
                          className="text-left text-xs text-red-700 hover:underline"
                          onClick={() => void onDeleteMember(m)}
                        >
                          Delete account permanently
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={m.portalRole === "admin" ? "admin" : "trainee"}
                      onChange={(e) => onRoleChange(m, e.target.value as "admin" | "trainee")}
                      className="rounded border border-[var(--siya-border)] px-2 py-1 text-xs"
                      disabled={m.id === user.id}
                    >
                      <option value="trainee">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-xs">{fmtWhen(m.lastLoginAt)}</td>
                  <td className="px-3 py-3 text-xs">
                    {m.training.modulesCompleted}/{moduleTotal}
                  </td>
                  <td className="px-3 py-3 text-xs">{m.training.finalExamReady ? "Yes" : "No"}</td>
                  <td className="px-3 py-3 text-xs">
                    {m.levelUp.totalXp} XP · streak {m.levelUp.streak}
                    {m.levelUp.lastActiveDate ? (
                      <span className="block text-[10px] text-[var(--siya-text-muted)]">
                        Last active {m.levelUp.lastActiveDate}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs">{m.levelUp.chatPracticeSessions || "—"}</td>
                  <td className="px-3 py-3 text-xs">{m.levelUp.usCultureSessions || "—"}</td>
                  <td className="px-3 py-3 text-xs">{m.levelUp.billingPracticeSessions || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && members.length === 0 && !error ? (
        <p className="text-sm text-[var(--siya-text-muted)]">No team members yet. Invite someone to get started.</p>
      ) : null}

      <DepartmentLeadsSection />
    </div>
  );
}
