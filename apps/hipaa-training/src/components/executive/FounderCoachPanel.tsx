"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  CollapsibleDomainItemList,
  FOUNDER_QUEUE_PREVIEW,
} from "@/components/executive/CollapsibleDomainItemList";
import {
  founderCoachBriefKey,
  fetchFounderCoachBrief,
  saveMonthlyPlan,
  saveWeeklyPlan,
  saveWeeklyActuals,
  logObserveEvent,
  lockWeeklyPlan,
  unlockWeeklyPlan,
  type BriefingConfidence,
  type DomainSnapshot,
  type DomainTabId,
  type DriftFlag,
  type FounderCoachBrief,
  type MonthlyPlanRecord,
  type TimeBudget,
  type WeeklyPlanRecord,
} from "@/lib/founder-coach-api";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import {
  portalBadgeWip,
  portalBtnAccentSm,
  portalBtnNavySm,
  portalChatShell,
  portalH3,
  portalSectionCompact,
  portalStatusInfoBox,
  portalStatusInfoText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

/** Talk = Ask engine (read-only). Plan Record stays manual — chat never writes Focus/Can Wait/Delegate/Observe. */
type CoachThreadId = "talk" | "plan" | DomainTabId;

const FOUNDER_TALK_OPENING =
  "Just talk to me — decisions, domain signals, check-ins, SOPs, who owns what. I answer from approved guides and live portal data. I never write Founder Focus, Can Wait, Delegate, or Observe-only; edit those yourself on This week's plan if you want.";

const DOMAIN_TAB_IDS: DomainTabId[] = ["accounts", "hr", "clinical", "marketing", "compliance"];

function confidenceLabel(c: BriefingConfidence): string {
  if (c === "high") return "High";
  if (c === "medium") return "Medium";
  return "Low";
}

function DriftFlagCard({ flag }: { flag: DriftFlag }) {
  const updated = new Date(flag.updatedAt);
  const freshMins = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 60000));
  return (
    <article className={`${portalStatusWarnBox} p-3 text-sm`}>
      <p className={`font-medium ${portalStatusWarnText}`}>{flag.message}</p>
      <div className={`mt-2 border-t border-[var(--siya-status-warn-border)]/60 pt-2 text-[10px] leading-relaxed ${portalStatusWarnText} opacity-90`}>
        <p>
          <span className="font-semibold">Confidence:</span> {confidenceLabel(flag.confidence)}
          {" · "}
          <span className="font-semibold">Updated:</span>{" "}
          {freshMins < 60 ? `${freshMins} min ago` : updated.toLocaleString()}
          {" · "}
          <span className="font-semibold">Based on:</span> {flag.evidence.length} signal
          {flag.evidence.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-1 list-inside list-disc">
          {flag.evidence.map((e) => (
            <li key={e.id}>{e.label}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function timeBudgetSum(tb: TimeBudget): number {
  return tb.clinical + tb.usFundraising + tb.indiaAmcare + tb.other;
}

function MonthlyPlanEditor({
  plan,
  weekStart,
  onSaved,
}: {
  plan: MonthlyPlanRecord;
  weekStart: string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(plan);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const sum = timeBudgetSum(draft.timeBudget);

  const updateOutcome = (idx: number, text: string) => {
    const outcomes = [...draft.outcomes];
    while (outcomes.length <= idx) outcomes.push({ id: `o-${outcomes.length}`, text: "" });
    outcomes[idx] = { ...outcomes[idx], text };
    setDraft({ ...draft, outcomes: outcomes.slice(0, 3) });
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (sum !== 100) {
      setErr("Time budget must sum to 100%.");
      return;
    }
    setSaving(true);
    try {
      await saveMonthlyPlan({
        monthKey: draft.monthKey,
        northStar: draft.northStar,
        timeBudget: draft.timeBudget,
        outcomes: draft.outcomes.filter((o) => o.text.trim()).slice(0, 3),
        notDoing: draft.notDoing.filter(Boolean),
        reviewTriggers: draft.reviewTriggers,
      });
      onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <p className="text-xs text-[var(--siya-text-muted)]">Founder edit only · team sees derived weekly brief</p>
      <label className="block text-xs font-semibold text-[var(--siya-text-secondary)]">
        North star this month
        <input
          value={draft.northStar}
          onChange={(e) => setDraft({ ...draft, northStar: e.target.value })}
          placeholder="One sentence — what matters most this month"
          className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm outline-none focus:border-[var(--siya-accent)]"
        />
      </label>
      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">
          Time budget (% — must sum to 100) · current: {sum}%
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {(
            [
              ["clinical", "Clinical"],
              ["usFundraising", "US fundraising"],
              ["indiaAmcare", "India (Amcare)"],
              ["other", "Other"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-[11px]">
              {label}
              <input
                type="number"
                min={0}
                max={100}
                value={draft.timeBudget[key]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    timeBudget: { ...draft.timeBudget, [key]: Number(e.target.value) || 0 },
                  })
                }
                className="mt-0.5 w-full rounded-lg border border-[var(--siya-border)] px-2 py-1.5"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">Outcomes (max 3)</legend>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            value={draft.outcomes[i]?.text ?? ""}
            onChange={(e) => updateOutcome(i, e.target.value)}
            className="mt-2 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          />
        ))}
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">NOT doing</legend>
        <textarea
          value={draft.notDoing.join("\n")}
          onChange={(e) =>
            setDraft({
              ...draft,
              notDoing: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          rows={3}
          className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
        />
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">Review triggers</legend>
        {draft.reviewTriggers.map((t, i) => (
          <input
            key={t.id}
            value={t.text}
            onChange={(e) => {
              const reviewTriggers = [...draft.reviewTriggers];
              reviewTriggers[i] = { ...t, text: e.target.value };
              setDraft({ ...draft, reviewTriggers });
            }}
            className="mt-2 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          />
        ))}
      </fieldset>
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      <button type="submit" disabled={saving} className={portalBtnAccentSm}>
        {saving ? "Saving…" : "Save monthly plan"}
      </button>
      <input type="hidden" value={weekStart} readOnly />
    </form>
  );
}

function MonthlyPlanReadOnly({ plan }: { plan: MonthlyPlanRecord }) {
  const tb = plan.timeBudget;
  return (
    <div className="space-y-2 text-sm">
      {plan.northStar ? <p className="italic">&ldquo;{plan.northStar}&rdquo;</p> : null}
      <p className="text-xs text-[var(--siya-text-muted)]">
        Time: {tb.clinical}% clinical · {tb.usFundraising}% US · {tb.indiaAmcare}% India · {tb.other}% other
      </p>
      {plan.outcomes.length ? (
        <ul className="list-inside list-disc text-sm">
          {plan.outcomes.map((o) => (
            <li key={o.id}>{o.text}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ActualsEditor({
  weekStart,
  actuals,
  onSaved,
}: {
  weekStart: string;
  actuals: FounderCoachBrief["actuals"];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState({
    adsTxCpa: actuals?.adsTxCpa ?? "",
    adsTxConversions: actuals?.adsTxConversions ?? "",
    adsCampaignEdits: actuals?.adsCampaignEdits ?? 0,
    indiaGrantsIdentified: actuals?.indiaGrantsIdentified ?? "",
    indiaApplicationsSubmitted: actuals?.indiaApplicationsSubmitted ?? "",
    usIntroContacted: actuals?.usIntroContacted ?? "",
    usIntroReplied: actuals?.usIntroReplied ?? "",
    usIntroMeetings: actuals?.usIntroMeetings ?? "",
    notes: actuals?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const num = (v: string | number) => (v === "" ? null : Number(v));
      await saveWeeklyActuals(weekStart, {
        adsTxCpa: num(draft.adsTxCpa),
        adsTxConversions: num(draft.adsTxConversions),
        adsCampaignEdits: Number(draft.adsCampaignEdits) || 0,
        indiaGrantsIdentified: num(draft.indiaGrantsIdentified),
        indiaApplicationsSubmitted: num(draft.indiaApplicationsSubmitted),
        usIntroContacted: num(draft.usIntroContacted),
        usIntroReplied: num(draft.usIntroReplied),
        usIntroMeetings: num(draft.usIntroMeetings),
        notes: draft.notes || null,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ["adsTxCpa", "TX/ADHD ads CPA ($)"],
    ["adsTxConversions", "TX/ADHD conversions"],
    ["adsCampaignEdits", "Campaign edits this week"],
    ["indiaGrantsIdentified", "India grants/schemes identified"],
    ["indiaApplicationsSubmitted", "India applications submitted"],
    ["usIntroContacted", "US intro: contacted"],
    ["usIntroReplied", "US intro: replied"],
    ["usIntroMeetings", "US intro: meetings booked"],
  ] as const;

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <p className="text-[11px] text-[var(--siya-text-muted)]">
        Ads / India / US intro for drift rules · Marketing/Clinical/Compliance actuals come from lead check-ins
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="text-[11px] font-medium">
            {label}
            <input
              type="number"
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
            />
          </label>
        ))}
      </div>
      <label className="block text-[11px] font-medium">
        Notes
        <input
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
        />
      </label>
      <button type="submit" disabled={saving} className={portalBtnNavySm}>
        {saving ? "Saving…" : "Save actuals"}
      </button>
    </form>
  );
}

function ObserveLogButton({
  observeId,
  weekStart,
  label,
  onLogged,
}: {
  observeId: string;
  weekStart: string;
  label: string;
  onLogged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await logObserveEvent(observeId, note || label, weekStart);
      setOpen(false);
      setNote("");
      onLogged?.();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-[11px] font-semibold ${portalStatusWarnText} underline`}
      >
        Log change under observe-only
      </button>
    );
  }
  return (
    <div className={`mt-2 ${portalStatusWarnBox} p-2`}>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What changed? (visible to team)"
        className="w-full rounded border px-2 py-1 text-xs"
      />
      <div className="mt-1 flex gap-2">
        <button type="button" onClick={submit} disabled={busy} className={`text-xs font-semibold ${portalStatusWarnText}`}>
          {busy ? "Logging…" : "Log"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Manual weekly plan editor — AI Draft/Refine/chat disconnected from UI (libs retained). */
function WeeklyPlanManualForm({
  plan,
  monthKey,
  weekStart,
  isLocked,
  canEdit,
  canUnlock,
  onSaved,
}: {
  plan: WeeklyPlanRecord;
  monthKey: string;
  weekStart: string;
  isLocked: boolean;
  canEdit: boolean;
  canUnlock: boolean;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(plan);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    if (draft.canWait.filter(Boolean).length > 3) {
      setErr("Can Wait is capped at 3.");
      return;
    }
    setSaving(true);
    try {
      await saveWeeklyPlan({
        weekStart,
        monthKey,
        prioritiesRaw: plan.prioritiesRaw ?? "",
        founderFocus: draft.founderFocus,
        canWait: draft.canWait.filter(Boolean).slice(0, 3),
        delegate: draft.delegate,
        observeOnly: draft.observeOnly,
      });
      setNote("Plan saved.");
      onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLock() {
    setErr(null);
    setNote(null);
    setLocking(true);
    try {
      await saveWeeklyPlan({
        weekStart,
        monthKey,
        prioritiesRaw: plan.prioritiesRaw ?? "",
        founderFocus: draft.founderFocus,
        canWait: draft.canWait.filter(Boolean).slice(0, 3),
        delegate: draft.delegate,
        observeOnly: draft.observeOnly,
      });
      const { plan: locked } = await lockWeeklyPlan(weekStart);
      setNote(`Locked ${locked.lockedAt ? new Date(locked.lockedAt).toLocaleString() : "now"}.`);
      onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Lock failed");
    } finally {
      setLocking(false);
    }
  }

  async function handleUnlock() {
    setErr(null);
    setNote(null);
    setLocking(true);
    try {
      await unlockWeeklyPlan(weekStart);
      setNote("Unlocked — you can edit again.");
      onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Unlock failed");
    } finally {
      setLocking(false);
    }
  }

  if (isLocked) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text-secondary)]">
          Week locked
          {plan.lockedAt ? ` · ${new Date(plan.lockedAt).toLocaleString()}` : ""}. Unlock to edit fields.
        </div>
        <div className="space-y-3 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">Founder Focus</p>
            <p className="mt-1 text-sm font-medium">{plan.founderFocus || "—"}</p>
          </div>
          {plan.canWait.filter(Boolean).length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">Can Wait</p>
              <ul className="mt-1 list-inside list-disc text-sm">
                {plan.canWait.filter(Boolean).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {plan.delegate.length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">Delegate</p>
              <ul className="mt-1 space-y-1 text-sm">
                {plan.delegate.map((d) => (
                  <li key={`${d.lane}-${d.ownerName}`}>
                    {d.lane} → {d.ownerName}
                    {d.note ? ` — ${d.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {plan.observeOnly.length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">Observe only</p>
              <ul className="mt-1 space-y-1 text-sm">
                {plan.observeOnly.map((o) => (
                  <li key={o.id}>
                    <strong>{o.lane}:</strong> {o.instruction}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {canUnlock ? (
          <button type="button" disabled={locking} onClick={() => void handleUnlock()} className={portalBtnNavySm}>
            {locking ? "Unlocking…" : "Unlock this week"}
          </button>
        ) : null}
        {err ? <p className="text-xs text-red-700">{err}</p> : null}
        {note ? <p className="text-xs text-[var(--siya-text-muted)]">{note}</p> : null}
      </div>
    );
  }

  if (!canEdit) {
    return (
      <p className="text-sm text-[var(--siya-text-muted)]">
        Read-only for your role — founder/exec can edit and lock this week&apos;s plan.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-[var(--siya-text-secondary)]">
        Edit this week&apos;s plan directly, then Save or Lock. Domain tabs stay for live portal signals.
      </p>

      <div className="space-y-3 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">Plan record</p>
        <label className="block text-xs font-semibold">
          Founder Focus (one decision)
          <textarea
            value={draft.founderFocus}
            onChange={(e) => setDraft({ ...draft, founderFocus: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold">
          Can Wait (max 3, one per line)
          <textarea
            value={draft.canWait.join("\n")}
            onChange={(e) => setDraft({ ...draft, canWait: e.target.value.split("\n").slice(0, 3) })}
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold">
          Delegate (lane|owner|note, one per line)
          <textarea
            value={draft.delegate.map((d) => [d.lane, d.ownerName, d.note || ""].join("|")).join("\n")}
            onChange={(e) =>
              setDraft({
                ...draft,
                delegate: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((line) => {
                    const [lane, ownerName, dNote] = line.split("|").map((s) => s.trim());
                    return { lane: lane || "", ownerName: ownerName || "Lead", note: dNote || undefined };
                  }),
              })
            }
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold">
          Observe only (id|lane|instruction, one per line)
          <textarea
            value={draft.observeOnly.map((o) => [o.id, o.lane, o.instruction].join("|")).join("\n")}
            onChange={(e) =>
              setDraft({
                ...draft,
                observeOnly: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((line, i) => {
                    const [id, lane, instruction] = line.split("|").map((s) => s.trim());
                    return {
                      id: id || `obs-${i}`,
                      lane: lane || id || `Observe ${i + 1}`,
                      instruction: instruction || "",
                    };
                  }),
              })
            }
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
      </div>

      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      {note ? <p className="text-xs text-[var(--siya-text-muted)]">{note}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={portalBtnAccentSm}>
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button type="button" disabled={locking || saving} onClick={() => void handleLock()} className={portalBtnNavySm}>
          {locking ? "Locking…" : "Lock this week"}
        </button>
      </div>
    </form>
  );
}

function PlanThreadView({
  data,
  onRefresh,
}: {
  data: FounderCoachBrief;
  onRefresh: () => void;
}) {
  const wp = data.weeklyPlan;
  const isLocked = Boolean(data.isWeekLocked || wp?.lockedAt);

  if (!wp || !(data.canEditWeekly || data.canEditMonthly || isLocked)) {
    return <p className="text-sm text-[var(--siya-text-muted)]">Weekly plan not available yet.</p>;
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className={portalH3}>This week&apos;s plan</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Week of {data.weekStart}</p>
      </header>
      <WeeklyPlanManualForm
        key={`${wp.updatedAt}-${wp.lockedAt ?? "open"}`}
        plan={wp}
        monthKey={data.monthKey}
        weekStart={data.weekStart}
        isLocked={isLocked}
        canEdit={Boolean(data.canEditWeekly)}
        canUnlock={Boolean(data.canEditMonthly)}
        onSaved={onRefresh}
      />
    </div>
  );
}

function domainStatusLabel(status: DomainSnapshot["status"]): string {
  if (status === "live") return "Live data";
  if (status === "partial") return "Partial";
  return "Not yet tracked";
}

function DomainThreadView({ domain }: { domain: DomainSnapshot }) {
  return (
    <div className="space-y-4">
      <article className={`${portalSectionCompact} !p-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={portalH3}>{domain.title}</h3>
          <span className={portalBadgeWip}>{domainStatusLabel(domain.status)}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">{domain.summary}</p>
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
          Phase 1 snapshot · talk through signals in Just talk to me · no invented numbers
        </p>
      </article>

      {domain.checkins.length ? (
        <article className={`${portalStatusInfoBox} p-4`}>
          <h3 className={`text-sm font-semibold ${portalStatusInfoText}`}>Weekly actuals (lead check-in)</h3>
          <ul className={`mt-3 space-y-3 text-sm ${portalStatusInfoText}`}>
            {domain.checkins.map((c) => (
              <li key={c.id} className="border-t border-[var(--siya-status-info-border)]/40 pt-3 first:border-0 first:pt-0">
                <p className="text-[11px] opacity-80">
                  {c.submitterName || "Lead"} · week of {c.weekStart}
                </p>
                {c.whatChanged ? (
                  <p className="mt-1">
                    <strong>What changed:</strong> {c.whatChanged}
                  </p>
                ) : null}
                {c.keyNumbersStatus ? (
                  <p className="mt-1">
                    <strong>Key numbers / status:</strong> {c.keyNumbersStatus}
                  </p>
                ) : null}
                {c.blockers ? (
                  <p className="mt-1">
                    <strong>Blockers:</strong> {c.blockers}
                  </p>
                ) : null}
                {c.founderShouldKnow ? (
                  <p className={`mt-1 font-medium ${portalStatusWarnText}`}>
                    Founder should know: {c.founderShouldKnow}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {domain.items.length ? (
        <article className={`${portalSectionCompact} !p-4`}>
          <h3 className={portalH3}>Items</h3>
          <CollapsibleDomainItemList items={domain.items} />
        </article>
      ) : (
        <p className="text-sm text-[var(--siya-text-muted)]">
          {domain.status === "not_tracked"
            ? "Nothing tracked yet — no fabricated numbers."
            : "No items this week from connected sources."}
        </p>
      )}

      {domain.placeholders.length ? (
        <article className="rounded-xl border border-dashed border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            Not yet tracked
          </h3>
          <ul className="mt-2 list-inside list-disc text-xs text-[var(--siya-text-muted)]">
            {domain.placeholders.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}

function threadButtonClass(active: boolean) {
  return active
    ? "w-full rounded-md px-2 py-1.5 text-left text-[12px] font-medium text-[var(--siya-primary)]"
    : "w-full rounded-md px-2 py-1.5 text-left text-[12px] font-normal text-[var(--siya-text-muted)] hover:text-[var(--siya-text-secondary)]";
}

export function FounderCoachPanel({ firstName }: { firstName?: string }) {
  const { user } = useAuth();
  const resolvedName = firstName ?? user?.name?.trim().split(/\s+/)[0];
  const { data, error, isLoading, mutate } = useSWR(
    isPortalAdmin(user?.role) ? founderCoachBriefKey : null,
    fetchFounderCoachBrief,
    {
      revalidateOnFocus: true,
      refreshInterval: 120_000,
    },
  );
  const [thread, setThread] = useState<CoachThreadId>("talk");
  const refresh = useCallback(() => void mutate(), [mutate]);
  const domains = data?.domains ?? [];
  const activeDomain =
    thread === "talk" || thread === "plan" ? null : domains.find((d) => d.id === thread) ?? null;

  if (!isPortalAdmin(user?.role)) return null;

  const talkChat = (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col gap-2">
      <header className="shrink-0">
        <h2 className={portalH3}>Ask</h2>
        <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
          Policies, coverage, difficult-patient paths — same engine as staff Ask. Plan Record stays on{" "}
          <strong>This week&apos;s plan</strong>.
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <AssistChatShell
          firstName={resolvedName}
          surface="founder-coach"
          openingOverride={FOUNDER_TALK_OPENING}
        />
      </div>
    </div>
  );

  const sideNav = (
    <>
      <nav
        aria-label="Founder Coach threads"
        className="hidden w-36 shrink-0 flex-col px-3 py-8 md:flex"
      >
        <button type="button" className={threadButtonClass(thread === "talk")} onClick={() => setThread("talk")}>
          Ask
        </button>
        <button type="button" className={threadButtonClass(thread === "plan")} onClick={() => setThread("plan")}>
          This week&apos;s plan
        </button>
        {DOMAIN_TAB_IDS.map((id) => {
          const domain = domains.find((d) => d.id === id);
          const label = domain?.title ?? id.charAt(0).toUpperCase() + id.slice(1);
          return (
            <button key={id} type="button" className={threadButtonClass(thread === id)} onClick={() => setThread(id)}>
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex gap-1 overflow-x-auto px-3 py-2 md:hidden">
        <button type="button" className={threadButtonClass(thread === "talk")} onClick={() => setThread("talk")}>
          Ask
        </button>
        <button type="button" className={threadButtonClass(thread === "plan")} onClick={() => setThread("plan")}>
          Plan
        </button>
        {DOMAIN_TAB_IDS.map((id) => {
          const domain = domains.find((d) => d.id === id);
          const label = domain?.title ?? id;
          return (
            <button key={id} type="button" className={threadButtonClass(thread === id)} onClick={() => setThread(id)}>
              {label}
            </button>
          );
        })}
      </div>
    </>
  );

  if (thread === "talk") {
    return (
      <div className={portalChatShell}>
        {sideNav}
        <main className="min-w-0 flex-1 px-4 pb-4 pt-3 md:px-8 md:py-4">{talkChat}</main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4">
        <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4">
        <p className="text-sm text-[var(--siya-text-muted)]">
          {error instanceof Error ? error.message : "Could not load coach brief."}
        </p>
      </div>
    );
  }

  return (
    <div className={portalChatShell}>
      {sideNav}

      <main className="min-w-0 flex-1 px-4 pb-8 pt-4 md:px-8 md:py-10">
        {thread === "plan" ? (
          <PlanThreadView data={data} onRefresh={refresh} />
        ) : activeDomain ? (
          <DomainThreadView domain={activeDomain} />
        ) : (
          <p className="text-sm text-[var(--siya-text-muted)]">Domain snapshot not available yet.</p>
        )}
      </main>
    </div>
  );
}
