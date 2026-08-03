"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  founderCoachBriefKey,
  fetchFounderCoachBrief,
  saveMonthlyPlan,
  saveWeeklyPlan,
  saveWeeklyActuals,
  logObserveEvent,
  type BriefingConfidence,
  type DriftFlag,
  type FounderCoachBrief,
  type MonthlyPlanRecord,
  type TimeBudget,
  type WeeklyPlanRecord,
} from "@/lib/founder-coach-api";
import {
  portalBadgeWip,
  portalBtnAccentSm,
  portalBtnNavySm,
  portalCapsLabel,
  portalH2,
  portalH3,
  portalSection,
  portalSectionCompact,
  portalStatusInfoBox,
  portalStatusInfoText,
  portalStatusWarnBox,
  portalStatusWarnText,
  portalTabActive,
  portalTabInactive,
} from "@/lib/portal-ui";

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
          <span className="font-semibold">Updated:</span> {freshMins < 60 ? `${freshMins} min ago` : updated.toLocaleString()}
          {" · "}
          <span className="font-semibold">Based on:</span> {flag.evidence.length} signal{flag.evidence.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-1 list-inside list-disc">
          {flag.evidence.map((e) => (
            <li key={e.id}>{e.label}</li>
          ))}
        </ul>
        <p className="mt-1 text-[11px] opacity-80">
          Trigger: <code className="text-[10px]">{flag.triggeredBy}</code>
        </p>
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
    <form onSubmit={handleSave} className={`space-y-4 ${portalSectionCompact}`}>
      <h3 className={portalH3}>
        Monthly plan · {draft.monthKey}
      </h3>
      <p className="text-xs text-[var(--siya-text-muted)]">Founder edit only · team sees derived weekly brief</p>

      <label className="block text-xs font-semibold text-[var(--siya-text-secondary)]">
        North star this month
        <input
          value={draft.northStar}
          onChange={(e) => setDraft({ ...draft, northStar: e.target.value })}
          placeholder="One sentence — what matters most in August"
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
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">Outcomes (max 3, measurable)</legend>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            value={draft.outcomes[i]?.text ?? ""}
            onChange={(e) => updateOutcome(i, e.target.value)}
            placeholder={
              i === 0
                ? "e.g. TX ads: 20–30 tracked conversions"
                : i === 1
                  ? "e.g. US intro list: N contacted"
                  : "e.g. Amcare grant: application submitted"
            }
            className="mt-2 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          />
        ))}
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">NOT doing (parking lot)</legend>
        <textarea
          value={draft.notDoing.join("\n")}
          onChange={(e) => setDraft({ ...draft, notDoing: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
        />
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-[var(--siya-text-secondary)]">Review triggers (if/then)</legend>
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
      <button
        type="submit"
        disabled={saving}
        className={portalBtnAccentSm}
      >
        {saving ? "Saving…" : "Save monthly plan"}
      </button>
      <input type="hidden" value={weekStart} readOnly />
    </form>
  );
}

function WeeklyPlanEditor({
  plan,
  monthKey,
  onSaved,
}: {
  plan: WeeklyPlanRecord;
  monthKey: string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(plan);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (draft.canWait.filter(Boolean).length > 3) {
      setErr("Can Wait is capped at 3.");
      return;
    }
    setSaving(true);
    try {
      await saveWeeklyPlan({
        weekStart: draft.weekStart,
        monthKey,
        founderFocus: draft.founderFocus,
        canWait: draft.canWait.filter(Boolean).slice(0, 3),
        delegate: draft.delegate,
        observeOnly: draft.observeOnly,
      });
      onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className={`space-y-3 ${portalSectionCompact}`}>
      <h3 className={portalH3}>Edit this week&apos;s brief</h3>
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
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      <button type="submit" disabled={saving} className={portalBtnAccentSm}>
        {saving ? "Saving…" : "Save weekly brief"}
      </button>
    </form>
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
    <form onSubmit={handleSave} className={portalSectionCompact}>
      <h3 className={portalH3}>Weekly actuals (manual entry)</h3>
      <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">Used for drift checks · automate later</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
      <label className="mt-2 block text-[11px] font-medium">
        Notes
        <input
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
        />
      </label>
      <button type="submit" disabled={saving} className={`mt-3 ${portalBtnNavySm}`}>
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

function WeeklyBriefView({ data, onRefresh }: { data: FounderCoachBrief; onRefresh: () => void }) {
  const wp = data.weeklyPlan;
  const mp = data.monthlyPlan;
  const ps = data.portalSignals;

  return (
    <div className="space-y-4">
      <article className={`${portalSectionCompact} !p-4`}>
        <h3 className={portalH3}>Founder Focus</h3>
        <p className="mt-2 text-sm font-medium text-[var(--siya-text-secondary)]">
          {wp?.founderFocus?.trim() ? wp.founderFocus : "Not set yet — founder should name one decision for this week."}
        </p>
      </article>

      <div className="grid gap-3 md:grid-cols-2">
        <article className={`${portalSectionCompact} !p-4`}>
          <h3 className={portalH3}>Can Wait</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-[var(--siya-text-secondary)]">
            {(wp?.canWait?.length ? wp.canWait : mp?.notDoing.slice(0, 3) ?? ["—"]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={`${portalSectionCompact} !p-4`}>
          <h3 className={portalH3}>Delegate</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {(wp?.delegate ?? []).map((d) => (
              <li key={d.lane}>
                <span className="font-medium">{d.lane}</span>
                <span className="text-[var(--siya-text-muted)]"> · {d.ownerName}</span>
                {d.note ? <p className="text-xs text-[var(--siya-text-muted)]">{d.note}</p> : null}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className={`${portalStatusInfoBox} p-4`}>
        <h3 className={`text-sm font-semibold ${portalStatusInfoText}`}>Observe only</h3>
        <ul className={`mt-2 space-y-3 text-sm ${portalStatusInfoText}`}>
          {(wp?.observeOnly ?? []).map((o) => (
            <li key={o.id}>
              <p>
                <strong>{o.lane}:</strong> {o.instruction}
              </p>
              <ObserveLogButton
                observeId={o.id}
                weekStart={data.weekStart}
                label={`Change logged: ${o.lane}`}
                onLogged={onRefresh}
              />
            </li>
          ))}
          {!wp?.observeOnly?.length ? <li className="text-[var(--siya-text-muted)]">None set for this week.</li> : null}
        </ul>
      </article>

      <article className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/60 p-4">
        <h3 className="text-sm font-semibold text-[var(--siya-primary)]">Signals this week</h3>
        <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">From staff portal + manual metrics · no invented data</p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li>
            Tasks completed today:{" "}
            <strong>
              {ps.tasksDoneToday} of {ps.tasksDueToday}
            </strong>
          </li>
          {ps.overdueTasks > 0 ? (
            <li>
              Overdue tasks: <strong>{ps.overdueTasks}</strong>
            </li>
          ) : null}
          <li>
            Open chat reviews (today): <strong>{ps.openChatReviews}</strong>{" "}
            <PortalNavLink href="/chat-review" className="text-xs text-[var(--siya-accent)] underline">
              Review
            </PortalNavLink>
          </li>
          <li>
            Shift handoffs today: <strong>{ps.shiftHandoffsToday}</strong>{" "}
            <PortalNavLink href="/team" className="text-xs text-[var(--siya-accent)] underline">
              Team
            </PortalNavLink>
          </li>
          <li>
            TX/ADHD CPA: <strong>{data.actuals?.adsTxCpa ?? "—"}</strong>
            {data.priorWeekActuals?.adsTxCpa != null ? ` (prior ${data.priorWeekActuals.adsTxCpa})` : null}
          </li>
          <li>
            TX conversions: <strong>{data.actuals?.adsTxConversions ?? "—"}</strong>
          </li>
          <li>
            India pipeline: <strong>{data.actuals?.indiaGrantsIdentified ?? "—"}</strong> identified ·{" "}
            <strong>{data.actuals?.indiaApplicationsSubmitted ?? "—"}</strong> submitted
          </li>
          <li>
            US intro: <strong>{data.actuals?.usIntroContacted ?? "—"}</strong> contacted ·{" "}
            <strong>{data.actuals?.usIntroReplied ?? "—"}</strong> replied ·{" "}
            <strong>{data.actuals?.usIntroMeetings ?? "—"}</strong> meetings
          </li>
        </ul>
      </article>

      {data.driftFlags.length ? (
        <div className="space-y-2">
          <h3 className={`text-sm font-semibold ${portalStatusWarnText}`}>Drift check</h3>
          {data.driftFlags.map((f) => (
            <DriftFlagCard key={f.id} flag={f} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--siya-text-muted)]">No drift flags from current rules.</p>
      )}

      {data.canEditWeekly ? (
        <>
          {wp ? <WeeklyPlanEditor plan={wp} monthKey={data.monthKey} onSaved={onRefresh} /> : null}
          <ActualsEditor weekStart={data.weekStart} actuals={data.actuals} onSaved={onRefresh} />
        </>
      ) : null}
    </div>
  );
}

function MonthlyPlanReadOnly({ plan }: { plan: MonthlyPlanRecord }) {
  const tb = plan.timeBudget;
  return (
    <article className={portalSectionCompact}>
      <h3 className={portalH3}>Monthly plan · {plan.monthKey}</h3>
      {plan.northStar ? <p className="mt-2 italic">&ldquo;{plan.northStar}&rdquo;</p> : null}
      <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
        Time: {tb.clinical}% clinical · {tb.usFundraising}% US · {tb.indiaAmcare}% India · {tb.other}% other
      </p>
      {plan.outcomes.length ? (
        <ul className="mt-2 list-inside list-disc">
          {plan.outcomes.map((o) => (
            <li key={o.id}>{o.text}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function FounderCoachPanel() {
  const { data, error, isLoading, mutate } = useSWR(founderCoachBriefKey, fetchFounderCoachBrief, {
    revalidateOnFocus: true,
    refreshInterval: 120_000,
  });
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const refresh = useCallback(() => void mutate(), [mutate]);

  const weekLabel = useMemo(() => {
    if (!data?.weekStart) return "";
    const d = new Date(`${data.weekStart}T12:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, [data?.weekStart]);

  if (isLoading) {
    return (
      <section className={portalSection}>
        <p className="text-sm text-[var(--siya-text-muted)]">Loading Founder Decision Coach…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className={portalSection}>
        <p className="text-sm text-[var(--siya-text-muted)]">
          {error instanceof Error ? error.message : "Could not load coach brief."}
        </p>
      </section>
    );
  }

  return (
    <section className={`space-y-4 ${portalSection}`}>
      <header>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className={portalCapsLabel}>
              Founder Decision Coach — Phase 1, in progress
            </p>
            <h2 className={`mt-1 ${portalH2}`}>
              Weekly brief
            </h2>
            <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">
              Rule-based comparison · shared with team · not an autonomous AI copilot
            </p>
          </div>
          <span className={portalBadgeWip}>
            August WIP
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
          Week of {weekLabel} · generated {new Date(data.generatedAt).toLocaleString()}
        </p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("weekly")}
          className={tab === "weekly" ? portalTabActive : portalTabInactive}
        >
          Weekly brief
        </button>
        <button
          type="button"
          onClick={() => setTab("monthly")}
          className={tab === "monthly" ? portalTabActive : portalTabInactive}
        >
          Monthly plan
        </button>
      </div>

      {tab === "weekly" ? (
        <WeeklyBriefView data={data} onRefresh={refresh} />
      ) : data.canEditMonthly && data.monthlyPlan ? (
        <MonthlyPlanEditor plan={data.monthlyPlan} weekStart={data.weekStart} onSaved={refresh} />
      ) : data.monthlyPlan ? (
        <MonthlyPlanReadOnly plan={data.monthlyPlan} />
      ) : (
        <p className="text-sm text-[var(--siya-text-muted)]">Monthly plan not published yet.</p>
      )}
    </section>
  );
}
