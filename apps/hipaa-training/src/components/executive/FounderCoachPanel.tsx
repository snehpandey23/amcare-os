"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  CollapsibleDomainItemList,
  FOUNDER_QUEUE_PREVIEW,
} from "@/components/executive/CollapsibleDomainItemList";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import {
  founderCoachBriefKey,
  fetchFounderCoachBrief,
  saveMonthlyPlan,
  saveWeeklyPlan,
  saveWeeklyActuals,
  logObserveEvent,
  draftWeeklyPlan,
  lockWeeklyPlan,
  unlockWeeklyPlan,
  type BriefingConfidence,
  type DomainSnapshot,
  type DomainTabId,
  type DriftFlag,
  type FounderCoachBrief,
  type MonthlyPlanRecord,
  type TimeBudget,
  type WeeklyPlanDraft,
  type WeeklyPlanRecord,
} from "@/lib/founder-coach-api";
import { getStoredToken } from "@/lib/authStorage";
import { notifyOwnerForGap } from "@/lib/siya-os/knowledge-gap";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import {
  portalBadgeWip,
  portalBtnAccentSm,
  portalBtnGhostSm,
  portalBtnNavySm,
  portalH3,
  portalSectionCompact,
  portalStatusInfoBox,
  portalStatusInfoText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

type CoachThreadId = "plan" | "assist" | DomainTabId;

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

function formatWeeklyDraftReply(ai: WeeklyPlanDraft, userText: string): string {
  const cites = ai.citations ?? [];
  const onlyFounder = cites.length === 0 || cites.every((c) => c.startsWith("founder."));
  const aiDown = ai.method === "deterministic" || Boolean(ai.aiUnavailable);
  const lines: string[] = [
    aiDown
      ? `**AI unavailable** — showing a basic non-AI scaffold from your text + portal counts (not a grounded AI plan)${
          ai.aiUnavailable ? `: ${ai.aiUnavailable.userMessage}` : ""
        }.`
      : `Here's an AI draft from your priorities${
          cites.length && !onlyFounder ? ` and ${cites.length} portal signal(s)` : ""
        } (${ai.method}):`,
    "",
    `**Founder Focus:** ${ai.founderFocus.trim() || "—"}`,
  ];
  if (ai.canWait.filter(Boolean).length) {
    lines.push("", "**Can Wait:**");
    ai.canWait.filter(Boolean).forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  }
  if (ai.delegate.length) {
    lines.push("", "**Delegate:**");
    for (const d of ai.delegate) {
      lines.push(`• ${d.lane} → ${d.ownerName}${d.note ? ` — ${d.note}` : ""}`);
    }
  }
  if (ai.observeOnly.length) {
    lines.push("", "**Observe:**");
    for (const o of ai.observeOnly) {
      lines.push(`• ${o.lane}: ${o.instruction}`);
    }
  }

  const lower = userText.toLowerCase();
  if (/fund|rais(e|ing)|capital|investor|pay myself|salary|compensation|draw|profit/.test(lower)) {
    lines.push(
      "",
      "**Pushback:** If the goal is cash to pay yourself, this week's Focus should be the highest-leverage *cash decision* (collections, pricing, ads pause/scale, grant deadline) — not a vague multi-month raise unless something is due now.",
    );
  }

  if (onlyFounder) {
    lines.push(
      "",
      "I don't have approved company knowledge on this beyond what you just typed — treating it as decision framing, not a researched plan. Flag missing pieces below so we can add them to company memory (doesn't have to be an SOP).",
    );
  } else if (cites.length) {
    lines.push("", `Signals used: ${cites.slice(0, 8).join(", ")}${cites.length > 8 ? "…" : ""}`);
  }

  lines.push("", "Edit the plan record below, refine if needed, then Save or Lock.");
  return lines.join("\n");
}

function coachFollowUpsForAsk(userText: string): string[] {
  const lower = userText.toLowerCase();
  if (/fund|rais(e|ing)|capital|investor|pay myself|salary|compensation|draw/.test(lower)) {
    return [
      "What's the minimum monthly draw you need in the next 90 days?",
      "US cash path vs India (Amcare) grants — which pool first?",
      "What single decision this week unlocks cash (vs “raise capital” as a narrative)?",
    ];
  }
  return [
    "What is the one decision only you can make this week?",
    "What should wait so Focus stays a single item?",
    "Who owns the next step if this isn't founder-only?",
  ];
}

function coachKnowledgeGapsForAsk(userText: string, draft: WeeklyPlanDraft): string[] {
  const gaps: string[] = [];
  const lower = userText.toLowerCase();
  const cites = draft.citations ?? [];
  const onlyFounder = cites.length === 0 || cites.every((c) => c.startsWith("founder."));
  if (/fund|rais(e|ing)|capital|investor/.test(lower)) {
    gaps.push("Fundraising approach & constraints for Siya Health (what’s on / off the table)");
  }
  if (/pay myself|salary|compensation|draw|profit/.test(lower)) {
    gaps.push("Founder compensation / personal draw policy (when and how)");
  }
  if (onlyFounder) {
    gaps.push("Company memory covering this topic — so Coach and Assist stay consistent");
  }
  return gaps.slice(0, 4);
}

function planFromSeedDraft(plan: WeeklyPlanRecord, weekStart: string, seed?: WeeklyPlanDraft | null): WeeklyPlanRecord {
  if (!seed) return plan;
  return {
    ...plan,
    weekStart,
    founderFocus: seed.founderFocus || plan.founderFocus,
    canWait: seed.canWait.length ? seed.canWait : plan.canWait,
    delegate: seed.delegate.length ? seed.delegate : plan.delegate,
    observeOnly: seed.observeOnly.length ? seed.observeOnly : plan.observeOnly,
  };
}

/** Editor for Draft/Refine/Lock — chat bubbles live in the parent thread only. */
function PlanChatComposer({
  plan,
  monthKey,
  weekStart,
  isLocked,
  canEdit,
  canUnlock,
  onSaved,
  seedPriorities,
  seedDraft,
}: {
  plan: WeeklyPlanRecord;
  monthKey: string;
  weekStart: string;
  isLocked: boolean;
  canEdit: boolean;
  canUnlock: boolean;
  onSaved: () => void;
  /** Prefill from the landing chat turn. */
  seedPriorities?: string;
  /** AI draft already produced by the parent send handler. */
  seedDraft?: WeeklyPlanDraft | null;
}) {
  const [prioritiesRaw, setPrioritiesRaw] = useState(
    (seedPriorities?.trim() || plan.prioritiesRaw) ?? "",
  );
  const [draft, setDraft] = useState(() => planFromSeedDraft(plan, weekStart, seedDraft));
  const [lastCitations, setLastCitations] = useState<string[]>(() => seedDraft?.citations ?? []);
  const [refineText, setRefineText] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [refining, setRefining] = useState(false);
  const [locking, setLocking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(() =>
    seedDraft
      ? `Draft applied (${seedDraft.method}, ${seedDraft.citations.length} citations). Refine or Save / Lock.`
      : null,
  );
  const draftInFlight = useRef(false);

  function applyDraftResult(
    ai: {
      founderFocus: string;
      canWait: string[];
      delegate: WeeklyPlanRecord["delegate"];
      observeOnly: WeeklyPlanRecord["observeOnly"];
      citations: string[];
      method: string;
    },
    mode: "draft" | "refine",
  ) {
    setDraft((prev) => ({
      ...prev,
      weekStart,
      prioritiesRaw,
      founderFocus: ai.founderFocus,
      canWait: ai.canWait,
      delegate: ai.delegate.length ? ai.delegate : prev.delegate,
      observeOnly: ai.observeOnly.length ? ai.observeOnly : prev.observeOnly,
    }));
    setLastCitations(ai.citations ?? []);
    setNote(
      mode === "refine"
        ? `Refined (${ai.method}, ${ai.citations.length} citations). Edit fields below or refine again — then Save / Lock.`
        : `Draft ready (${ai.method}, ${ai.citations.length} citations). Edit Focus / Can Wait / Delegate, or refine.`,
    );
  }

  async function handleDraft() {
    if (draftInFlight.current) return;
    setErr(null);
    setNote(null);
    const tip = prioritiesRaw.trim();
    if (!tip) {
      setErr("Share priorities for this week before Draft.");
      return;
    }
    draftInFlight.current = true;
    setDrafting(true);
    try {
      const { draft: ai } = await draftWeeklyPlan(prioritiesRaw);
      applyDraftResult(ai, "draft");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Draft failed");
    } finally {
      draftInFlight.current = false;
      setDrafting(false);
    }
  }

  async function handleRefine() {
    if (draftInFlight.current) return;
    setErr(null);
    setNote(null);
    const instruction = refineText.trim();
    if (!instruction) {
      setErr("Type an adjustment before Refine.");
      return;
    }
    if (!draft.founderFocus.trim() && !draft.canWait.some(Boolean)) {
      setErr("Run Draft breakdown first, then Refine.");
      return;
    }
    draftInFlight.current = true;
    setRefining(true);
    try {
      const { draft: ai } = await draftWeeklyPlan(prioritiesRaw, {
        refineInstruction: instruction,
        currentDraft: {
          founderFocus: draft.founderFocus,
          canWait: draft.canWait.filter(Boolean),
          delegate: draft.delegate,
          observeOnly: draft.observeOnly,
          citations: lastCitations,
        },
      });
      applyDraftResult(ai, "refine");
      setRefineText("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Refine failed");
    } finally {
      draftInFlight.current = false;
      setRefining(false);
    }
  }

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
        prioritiesRaw,
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
        prioritiesRaw,
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
      <div className="space-y-3">
        <div className="rounded-2xl bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text-secondary)]">
          Week locked
          {plan.lockedAt ? ` · ${new Date(plan.lockedAt).toLocaleString()}` : ""}. Draft / Refine hidden until unlock.
        </div>
        {plan.prioritiesRaw?.trim() ? (
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[var(--siya-btn-primary)] px-3 py-2 text-sm text-white">
            <p className="whitespace-pre-wrap">{plan.prioritiesRaw}</p>
          </div>
        ) : null}
        <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-2 text-sm">
          <p className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">Founder Focus</p>
          <p className="mt-1 font-medium">{plan.founderFocus || "—"}</p>
        </div>
        {canUnlock ? (
          <button type="button" disabled={locking} onClick={() => void handleUnlock()} className={portalBtnNavySm}>
            {locking ? "Unlocking…" : "Unlock to draft / refine"}
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
        Read-only for your role — founder/exec can draft and lock this week&apos;s plan.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="flex min-h-[320px] flex-col gap-3">
      <p className="rounded-2xl bg-[var(--siya-bg-subtle)] px-3 py-2 text-[11px] text-[var(--siya-text-muted)]">
        Re-draft or refine below if needed — structured fields are the record of truth. Then Save / Lock.
      </p>

      <label className="block text-xs font-semibold">
        This week&apos;s priorities
        <textarea
          value={prioritiesRaw}
          onChange={(e) => setPrioritiesRaw(e.target.value)}
          rows={3}
          placeholder="What matters this week? Decisions, risks, people to unblock…"
          className="mt-1 w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-2 text-sm"
          disabled={drafting || refining}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={drafting || refining} onClick={() => void handleDraft()} className={portalBtnNavySm}>
          {drafting ? "Drafting…" : seedDraft ? "Re-draft breakdown" : "Draft breakdown"}
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/40 p-3">
        <label className="block text-xs font-semibold">
          Refine (adjustment to current draft — not a chat thread)
          <input
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            placeholder='e.g. "Move India grant to Can Wait" or "Focus on TX ads pause decision"'
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            disabled={drafting || refining}
          />
        </label>
        <button
          type="button"
          disabled={drafting || refining || !refineText.trim()}
          onClick={() => void handleRefine()}
          className={portalBtnGhostSm}
        >
          {refining ? "Refining…" : "Refine"}
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3">
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
      <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-[var(--siya-border)] bg-[var(--siya-white)]/95 pt-3">
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

type CoachIntent = "attention" | "drift" | "signals" | "week" | "actuals" | "monthly" | "observe" | "plan";

type CoachTurn = {
  id: string;
  role: "user" | "coach";
  text: string;
  panel?: CoachIntent;
  seedPriorities?: string;
  seedDraft?: WeeklyPlanDraft | null;
  followUps?: string[];
  knowledgeGaps?: string[];
  drafting?: boolean;
};

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function matchCoachIntent(raw: string): CoachIntent | "free" {
  const t = raw.toLowerCase().trim();
  if (!t) return "free";
  // Short / explicit asks first — free-form priorities fall through to "free" → plan draft.
  if (
    /^(what needs my attention|needs? my attention|attention queue|what should i (look at|focus on|do)\??)$/.test(t) ||
    /\bwhat needs my attention\b/.test(t)
  ) {
    return "attention";
  }
  if (/^(drift( check)?|show drift|any drift)\??$/.test(t) || /\b(show|any) drift\b/.test(t)) return "drift";
  if (
    /\b(how's this week|how is this week|how is the week|how'?s the week|week going|status this week)\b/.test(t)
  ) {
    return "week";
  }
  if (/^(signals?|show signals?|portal signals?)\??$/.test(t)) return "signals";
  if (/^(actuals|show actuals|drift metrics|manual actuals)\??$/.test(t)) return "actuals";
  if (/^(monthly( plan)?|show monthly|north star|time budget)\??$/.test(t) || /\bmonthly plan\b/.test(t)) {
    return "monthly";
  }
  if (/^(observe( only)?|show observe)\??$/.test(t)) return "observe";
  if (
    /^(draft( this week'?s)?( plan)?|weekly plan|plan this week|lock (this |the )?week)\??$/.test(t) ||
    /\bdraft this week'?s plan\b/.test(t)
  ) {
    return "plan";
  }
  return "free";
}

function PlanThreadView({
  data,
  onRefresh,
  firstName,
}: {
  data: FounderCoachBrief;
  onRefresh: () => void;
  firstName?: string;
}) {
  const wp = data.weeklyPlan;
  const mp = data.monthlyPlan;
  const ps = data.portalSignals;
  const leadSignals = data.leadCheckInSignals ?? [];
  const isLocked = Boolean(data.isWeekLocked || wp?.lockedAt);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<CoachTurn[]>([]);
  const [sending, setSending] = useState(false);
  const [gapNote, setGapNote] = useState<string | null>(null);

  const attentionQueue = useMemo(() => {
    const byId = new Map<string, (typeof leadSignals)[number]>();
    for (const d of data.domains ?? []) {
      for (const item of d.items) byId.set(item.id, item);
    }
    for (const item of leadSignals) byId.set(item.id, item);
    return [...byId.values()];
  }, [data.domains, leadSignals]);

  const greeting = `${timeOfDayGreeting()}${firstName ? `, ${firstName}` : ""} — what's on your mind today?`;

  async function flagKnowledgeGaps(gaps: string[], sourceQuestion: string) {
    setGapNote(null);
    const token = getStoredToken();
    if (!token) {
      setGapNote("Sign in required to flag knowledge.");
      return;
    }
    const task = gaps.join(" · ").slice(0, 500) || "Missing company memory";
    const question = `Founder Coach gap: ${sourceQuestion.slice(0, 400)}\n\nMissing:\n- ${gaps.join("\n- ")}`.slice(
      0,
      2000,
    );
    try {
      const res = await fetch("/api/knowledge-gap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          department: "Leadership",
          task,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; route?: { mode?: string } };
      if (!res.ok) throw new Error(body.error || `Flag failed (${res.status})`);
      notifyOwnerForGap({
        question,
        department: "Leadership",
        task,
        routeMode: body.route?.mode === "lead_digest" ? "lead_digest" : "founder_instant",
      });
      setGapNote("Flagged for company memory / Leadership — not an SOP requirement.");
    } catch (ex) {
      setGapNote(ex instanceof Error ? ex.message : "Could not flag knowledge gap");
    }
  }

  async function pushIntent(intent: CoachIntent | "free", userText: string) {
    const id = `t-${Date.now()}`;
    const text = userText.trim() || (intent === "plan" ? "Draft this week's plan" : "");
    if (!text && intent !== "plan") return;

    if (intent === "free" || intent === "plan") {
      const isPlanAffordance =
        intent === "plan" &&
        /^(draft( this week'?s)?( plan)?|weekly plan|plan this week)$/i.test(userText.trim());
      const seed = isPlanAffordance ? wp?.prioritiesRaw?.trim() || "" : text;
      const userId = `${id}-u`;
      const coachId = `${id}-c`;

      // Open workspace without auto-draft when affordance is empty "Draft this week's plan"
      if (isPlanAffordance && !seed) {
        setTurns((prev) => [
          ...prev,
          { id: userId, role: "user", text: "Draft this week's plan" },
          {
            id: coachId,
            role: "coach",
            text: "Here's the weekly plan workspace — add priorities, then Draft, Refine, Save / Lock.",
            panel: "plan",
            seedPriorities: "",
          },
        ]);
        return;
      }

      if (isLocked) {
        setTurns((prev) => [
          ...prev,
          { id: userId, role: "user", text },
          {
            id: coachId,
            role: "coach",
            text: "This week is locked. Unlock to draft or change Focus / Can Wait / Delegate.",
            panel: "plan",
            seedPriorities: seed,
          },
        ]);
        return;
      }

      setTurns((prev) => [
        ...prev,
        { id: userId, role: "user", text },
        {
          id: coachId,
          role: "coach",
          text: "Working on an AI draft from your priorities and this week's signals…",
          drafting: true,
        },
      ]);

      try {
        const { draft: ai } = await draftWeeklyPlan(seed);
        const followUps = coachFollowUpsForAsk(seed);
        const knowledgeGaps = coachKnowledgeGapsForAsk(seed, ai);
        setTurns((prev) =>
          prev.map((t) =>
            t.id === coachId
              ? {
                  ...t,
                  drafting: false,
                  text: formatWeeklyDraftReply(ai, seed),
                  panel: "plan" as const,
                  seedPriorities: seed,
                  seedDraft: ai,
                  followUps,
                  knowledgeGaps,
                }
              : t,
          ),
        );
      } catch (ex) {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === coachId
              ? {
                  ...t,
                  drafting: false,
                  text: `Draft failed: ${ex instanceof Error ? ex.message : "unknown error"}. You can still open the plan workspace and try Draft breakdown.`,
                  panel: "plan",
                  seedPriorities: seed,
                }
              : t,
          ),
        );
      }
      return;
    }

    const replies: Record<Exclude<CoachIntent, "plan">, string> = {
      attention: attentionQueue.length
        ? `Here's what needs attention (top ${FOUNDER_QUEUE_PREVIEW} by urgency).`
        : "Nothing in the attention queue from connected sources this week.",
      drift: data.driftFlags.length
        ? `${data.driftFlags.length} drift flag${data.driftFlags.length === 1 ? "" : "s"} from current rules.`
        : "No drift flags from current rules.",
      signals: "Signals from portal counts and lead check-ins this week.",
      week: "Here's how this week looks — drift and signals.",
      actuals: "Manual drift metrics (ads / India / US intro). Marketing/Clinical/Compliance actuals come from lead check-ins.",
      monthly: `Monthly plan · ${mp?.monthKey ?? data.monthKey}.`,
      observe: "Observe-only flags for this week — log changes without rewriting the locked plan.",
    };

    const panel: CoachIntent = intent === "week" ? "week" : intent;
    setTurns((prev) => [
      ...prev,
      { id: `${id}-u`, role: "user", text },
      { id: `${id}-c`, role: "coach", text: replies[intent === "week" ? "week" : intent], panel },
    ]);
  }

  async function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      await pushIntent(matchCoachIntent(text), text);
    } finally {
      setSending(false);
    }
  }

  function affordance(intent: CoachIntent, label: string) {
    return (
      <button
        key={intent}
        type="button"
        disabled={sending}
        className="text-[11px] text-[var(--siya-text-muted)] underline-offset-2 hover:text-[var(--siya-accent)] hover:underline disabled:opacity-50"
        onClick={() => void pushIntent(intent, label)}
      >
        {label}
      </button>
    );
  }

  function renderPanel(turn: CoachTurn) {
    if (!turn.panel) return null;
    if (turn.panel === "attention") {
      return attentionQueue.length ? <CollapsibleDomainItemList items={attentionQueue} /> : null;
    }
    if (turn.panel === "drift") {
      return data.driftFlags.length ? (
        <div className="space-y-2">
          {data.driftFlags.map((f) => (
            <DriftFlagCard key={f.id} flag={f} />
          ))}
        </div>
      ) : null;
    }
    if (turn.panel === "signals") {
      return (
        <div className="space-y-3">
          {leadSignals.length ? <CollapsibleDomainItemList items={leadSignals} /> : (
            <p className="text-xs text-[var(--siya-text-muted)]">No lead check-ins filed for this week yet.</p>
          )}
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li>
              Tasks today:{" "}
              <strong>
                {ps.tasksDoneToday}/{ps.tasksDueToday}
              </strong>
            </li>
            {ps.overdueTasks > 0 ? (
              <li>
                Overdue: <strong>{ps.overdueTasks}</strong>
              </li>
            ) : null}
            <li>
              Chat reviews: <strong>{ps.openChatReviews}</strong>{" "}
              <PortalNavLink href="/chat-review" className="text-xs text-[var(--siya-accent)] underline">
                Review
              </PortalNavLink>
            </li>
            <li>
              Handoffs: <strong>{ps.shiftHandoffsToday}</strong>
            </li>
            <li>
              TX CPA: <strong>{data.actuals?.adsTxCpa ?? "—"}</strong>
            </li>
            <li>
              TX conversions: <strong>{data.actuals?.adsTxConversions ?? "—"}</strong>
            </li>
          </ul>
        </div>
      );
    }
    if (turn.panel === "week") {
      return (
        <div className="space-y-4">
          {data.driftFlags.length ? (
            <div className="space-y-2">
              {data.driftFlags.map((f) => (
                <DriftFlagCard key={f.id} flag={f} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--siya-text-muted)]">No drift flags.</p>
          )}
          {renderPanel({ ...turn, panel: "signals" })}
        </div>
      );
    }
    if (turn.panel === "actuals") {
      return data.canEditWeekly ? (
        <ActualsEditor weekStart={data.weekStart} actuals={data.actuals} onSaved={onRefresh} />
      ) : (
        <p className="text-sm text-[var(--siya-text-muted)]">Actuals edit is founder/exec only.</p>
      );
    }
    if (turn.panel === "monthly") {
      if (data.canEditMonthly && mp) {
        return <MonthlyPlanEditor plan={mp} weekStart={data.weekStart} onSaved={onRefresh} />;
      }
      if (mp) return <MonthlyPlanReadOnly plan={mp} />;
      return <p className="text-sm text-[var(--siya-text-muted)]">Monthly plan not published yet.</p>;
    }
    if (turn.panel === "observe") {
      return (
        <ul className={`space-y-3 text-sm ${portalStatusInfoText}`}>
          {(wp?.observeOnly ?? []).map((o) => (
            <li key={o.id}>
              <p>
                <strong>{o.lane}:</strong> {o.instruction}
              </p>
              {!isLocked ? (
                <ObserveLogButton
                  observeId={o.id}
                  weekStart={data.weekStart}
                  label={`Change logged: ${o.lane}`}
                  onLogged={onRefresh}
                />
              ) : null}
            </li>
          ))}
          {!wp?.observeOnly?.length ? <li className="text-[var(--siya-text-muted)]">None set for this week.</li> : null}
        </ul>
      );
    }
    if (turn.panel === "plan") {
      if (!wp || !(data.canEditWeekly || data.canEditMonthly || isLocked)) {
        return <p className="text-sm text-[var(--siya-text-muted)]">Weekly plan not available yet.</p>;
      }
      return (
        <PlanChatComposer
          key={`plan-${turn.id}`}
          plan={wp}
          monthKey={data.monthKey}
          weekStart={data.weekStart}
          isLocked={isLocked}
          canEdit={Boolean(data.canEditWeekly)}
          canUnlock={Boolean(data.canEditMonthly)}
          onSaved={onRefresh}
          seedPriorities={turn.seedPriorities}
          seedDraft={turn.seedDraft}
        />
      );
    }
    return null;
  }

  const empty = turns.length === 0;

  return (
    <div className="flex min-h-[min(70dvh,640px)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {empty ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
            <p className="font-[family-name:var(--font-poppins)] text-xl font-medium text-[var(--siya-primary)] md:text-2xl">
              {greeting}
            </p>
          </div>
        ) : (
          turns.map((turn) =>
            turn.role === "user" ? (
              <div
                key={turn.id}
                className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--siya-btn-primary)] px-3.5 py-2.5 text-sm text-white"
              >
                {turn.text}
              </div>
            ) : (
              <div key={turn.id} className="max-w-[96%] space-y-3">
                <div className="rounded-2xl rounded-bl-md border border-[var(--siya-border)] bg-[var(--siya-white)] px-3.5 py-2.5 text-sm text-[var(--siya-text-secondary)] whitespace-pre-wrap">
                  {turn.text}
                </div>
                {turn.followUps?.length ? (
                  <div className="rounded-lg border border-[var(--siya-border)]/70 bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text-secondary)]">
                    <p className="font-semibold text-[var(--siya-primary)]">Follow-ups</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {turn.followUps.map((q) => (
                        <li key={q}>
                          <button
                            type="button"
                            className="text-left text-[var(--siya-accent)] hover:underline"
                            disabled={sending}
                            onClick={() => {
                              setInput(q);
                            }}
                          >
                            {q}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {turn.knowledgeGaps?.length ? (
                  <div className={`${portalStatusWarnBox} px-3 py-2 text-xs ${portalStatusWarnText}`}>
                    <p className="font-semibold">Missing company knowledge (not necessarily an SOP)</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {turn.knowledgeGaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`mt-2 ${portalBtnGhostSm}`}
                      onClick={() =>
                        void flagKnowledgeGaps(
                          turn.knowledgeGaps ?? [],
                          turn.seedPriorities || "Founder Coach ask",
                        )
                      }
                    >
                      Flag missing knowledge
                    </button>
                    {gapNote ? <p className="mt-1 text-[11px] opacity-90">{gapNote}</p> : null}
                  </div>
                ) : null}
                {turn.panel ? (
                  <div className="rounded-xl border border-[var(--siya-border)]/80 bg-[var(--siya-white)]/90 p-3 shadow-[var(--siya-shadow)]">
                    {renderPanel(turn)}
                  </div>
                ) : null}
              </div>
            ),
          )
        )}
      </div>

      <form onSubmit={onSend} className="sticky bottom-0 border-t border-[var(--siya-border)]/60 bg-[var(--siya-bg-page)]/95 pt-3 backdrop-blur">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's on your mind…"
            className="min-w-0 flex-1 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3 text-sm outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20"
            autoFocus
          />
          <VoiceInputButton value={input} onChange={setInput} size="md" />
          <button type="submit" disabled={!input.trim() || sending} className={portalBtnAccentSm}>
            {sending ? "…" : "Send"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-0.5">
          {affordance("attention", "What needs my attention")}
          {affordance("week", "How's this week going")}
          {affordance("monthly", "Monthly plan")}
          {affordance("plan", "Draft this week's plan")}
          {affordance("actuals", "Actuals")}
        </div>
      </form>
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
          Phase 1 snapshot · grounded Q&amp;A chat comes in Phase 2 · no invented numbers
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
  const [thread, setThread] = useState<CoachThreadId>("plan");
  const refresh = useCallback(() => void mutate(), [mutate]);
  const domains = data?.domains ?? [];
  const activeDomain =
    thread === "plan" || thread === "assist" ? null : domains.find((d) => d.id === thread) ?? null;

  if (!isPortalAdmin(user?.role)) return null;

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
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col md:flex-row md:gap-2">
      <nav
        aria-label="Founder Coach threads"
        className="hidden w-36 shrink-0 flex-col px-3 py-8 md:flex"
      >
        <button type="button" className={threadButtonClass(thread === "plan")} onClick={() => setThread("plan")}>
          This week&apos;s plan
        </button>
        <button type="button" className={threadButtonClass(thread === "assist")} onClick={() => setThread("assist")}>
          Assist
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
        <button type="button" className={threadButtonClass(thread === "plan")} onClick={() => setThread("plan")}>
          Plan
        </button>
        <button type="button" className={threadButtonClass(thread === "assist")} onClick={() => setThread("assist")}>
          Assist
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

      <main className="min-w-0 flex-1 px-4 pb-8 pt-4 md:px-8 md:py-10">
        {thread === "plan" ? (
          <PlanThreadView data={data} onRefresh={refresh} firstName={resolvedName} />
        ) : thread === "assist" ? (
          <div className="flex min-h-[min(70dvh,640px)] flex-col">
            <AssistChatShell firstName={resolvedName} />
          </div>
        ) : activeDomain ? (
          <DomainThreadView domain={activeDomain} />
        ) : (
          <p className="text-sm text-[var(--siya-text-muted)]">Domain snapshot not available yet.</p>
        )}
      </main>
    </div>
  );
}
