import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { istDateLabel } from "./shift-dashboard.js";
export { istDateLabel };
import { isExecutiveUser } from "./executive-briefing.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type BriefingConfidence = "high" | "medium" | "low";

export type TimeBudget = {
  clinical: number;
  usFundraising: number;
  indiaAmcare: number;
  other: number;
};

export type MonthlyOutcome = { id: string; text: string };

export type ReviewTrigger = {
  id: string;
  text: string;
  metricKey?: "ads_tx_cpa" | "ads_tx_conversions";
  thresholdPct?: number;
  weeks?: number;
};

export type MonthlyPlanRecord = {
  monthKey: string;
  northStar: string;
  timeBudget: TimeBudget;
  outcomes: MonthlyOutcome[];
  notDoing: string[];
  reviewTriggers: ReviewTrigger[];
  updatedAt: string;
};

export type DelegateLane = {
  lane: string;
  ownerName: string;
  note?: string;
};

export type ObserveOnlyFlag = {
  id: string;
  lane: string;
  instruction: string;
};

export type WeeklyPlanRecord = {
  weekStart: string;
  monthKey: string | null;
  founderFocus: string;
  canWait: string[];
  delegate: DelegateLane[];
  observeOnly: ObserveOnlyFlag[];
  updatedAt: string;
};

export type WeeklyActualsRecord = {
  weekStart: string;
  adsTxCpa: number | null;
  adsTxConversions: number | null;
  adsCampaignEdits: number;
  indiaGrantsIdentified: number | null;
  indiaApplicationsSubmitted: number | null;
  usIntroContacted: number | null;
  usIntroReplied: number | null;
  usIntroMeetings: number | null;
  notes: string | null;
  updatedAt: string;
};

export type PortalSignals = {
  openChatReviews: number;
  shiftHandoffsToday: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDoneToday: number;
};

export type DriftEvidence = { id: string; label: string };

export type DriftFlag = {
  id: string;
  message: string;
  confidence: BriefingConfidence;
  evidence: DriftEvidence[];
  updatedAt: string;
  triggeredBy: string;
};

export type FounderCoachBriefPayload = {
  phase: 1;
  statusLabel: "in_progress";
  generatedAt: string;
  weekStart: string;
  monthKey: string;
  monthlyPlan: MonthlyPlanRecord | null;
  weeklyPlan: WeeklyPlanRecord | null;
  actuals: WeeklyActualsRecord | null;
  priorWeekActuals: WeeklyActualsRecord | null;
  portalSignals: PortalSignals;
  driftFlags: DriftFlag[];
  canEditMonthly: boolean;
  canEditWeekly: boolean;
};

export const DEFAULT_NOT_DOING = [
  "Austin clinic expansion",
  "Tech platform rebuild",
  "B2B employer partnerships",
  "Agent org chart / multi-agent COO stack",
  "New geo expansion beyond TX focus",
];

let schemaReady: Promise<void> | null = null;

export async function ensureFounderCoachTablesReady(pool: pg.Pool): Promise<void> {
  if (!schemaReady) {
    schemaReady = ensureFounderCoachTables(pool).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function ensureFounderCoachTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dirname, "database", "founder-coach-schema.sql"), "utf8");
  await pool.query(sql);
}

/** IST calendar Monday for the week containing `at`. */
export function istWeekStart(at = new Date()): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const day = ist.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  ist.setUTCDate(ist.getUTCDate() + diff);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(utc);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function parseTimeBudget(raw: unknown): TimeBudget {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, number>;
  return {
    clinical: Number(o.clinical) || 0,
    usFundraising: Number(o.usFundraising) || 0,
    indiaAmcare: Number(o.indiaAmcare) || 0,
    other: Number(o.other) || 0,
  };
}

function rowToMonthly(row: Record<string, unknown>): MonthlyPlanRecord {
  return {
    monthKey: row.month_key as string,
    northStar: (row.north_star as string) ?? "",
    timeBudget: parseTimeBudget(row.time_budget),
    outcomes: (row.outcomes as MonthlyOutcome[]) ?? [],
    notDoing: (row.not_doing as string[]) ?? [],
    reviewTriggers: (row.review_triggers as ReviewTrigger[]) ?? [],
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

function rowToWeekly(row: Record<string, unknown>): WeeklyPlanRecord {
  return {
    weekStart: new Date(row.week_start as string).toISOString().slice(0, 10),
    monthKey: (row.month_key as string) ?? null,
    founderFocus: (row.founder_focus as string) ?? "",
    canWait: (row.can_wait as string[]) ?? [],
    delegate: (row.delegate as DelegateLane[]) ?? [],
    observeOnly: (row.observe_only as ObserveOnlyFlag[]) ?? [],
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

function rowToActuals(row: Record<string, unknown>): WeeklyActualsRecord {
  return {
    weekStart: new Date(row.week_start as string).toISOString().slice(0, 10),
    adsTxCpa: row.ads_tx_cpa != null ? Number(row.ads_tx_cpa) : null,
    adsTxConversions: row.ads_tx_conversions != null ? Number(row.ads_tx_conversions) : null,
    adsCampaignEdits: Number(row.ads_campaign_edits ?? 0),
    indiaGrantsIdentified: row.india_grants_identified != null ? Number(row.india_grants_identified) : null,
    indiaApplicationsSubmitted:
      row.india_applications_submitted != null ? Number(row.india_applications_submitted) : null,
    usIntroContacted: row.us_intro_contacted != null ? Number(row.us_intro_contacted) : null,
    usIntroReplied: row.us_intro_replied != null ? Number(row.us_intro_replied) : null,
    usIntroMeetings: row.us_intro_meetings != null ? Number(row.us_intro_meetings) : null,
    notes: (row.notes as string) ?? null,
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export async function getMonthlyPlan(pool: pg.Pool, monthKey: string): Promise<MonthlyPlanRecord | null> {
  await ensureFounderCoachTablesReady(pool);
  const r = await pool.query(`SELECT * FROM founder_monthly_plans WHERE month_key = $1`, [monthKey]);
  if (!r.rows[0]) return null;
  return rowToMonthly(r.rows[0] as Record<string, unknown>);
}

export async function upsertMonthlyPlan(
  pool: pg.Pool,
  userId: string,
  input: {
    monthKey: string;
    northStar: string;
    timeBudget: TimeBudget | Record<string, number>;
    outcomes: MonthlyOutcome[];
    notDoing: string[];
    reviewTriggers: ReviewTrigger[];
  },
): Promise<MonthlyPlanRecord> {
  await ensureFounderCoachTablesReady(pool);
  const timeBudget = parseTimeBudget(input.timeBudget);
  const sum =
    timeBudget.clinical +
    timeBudget.usFundraising +
    timeBudget.indiaAmcare +
    timeBudget.other;
  if (sum !== 100) {
    throw new Error("Time budget must sum to 100%");
  }
  const id = `fmp-${input.monthKey}`;
  await pool.query(
    `INSERT INTO founder_monthly_plans (id, month_key, north_star, time_budget, outcomes, not_doing, review_triggers, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (month_key) DO UPDATE SET
       north_star = EXCLUDED.north_star,
       time_budget = EXCLUDED.time_budget,
       outcomes = EXCLUDED.outcomes,
       not_doing = EXCLUDED.not_doing,
       review_triggers = EXCLUDED.review_triggers,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [
      id,
      input.monthKey,
      input.northStar.slice(0, 500),
      JSON.stringify(timeBudget),
      JSON.stringify(input.outcomes.slice(0, 3)),
      JSON.stringify(input.notDoing.slice(0, 10)),
      JSON.stringify(input.reviewTriggers.slice(0, 10)),
      userId,
    ],
  );
  return (await getMonthlyPlan(pool, input.monthKey))!;
}

export async function getWeeklyPlan(pool: pg.Pool, weekStart: string): Promise<WeeklyPlanRecord | null> {
  await ensureFounderCoachTablesReady(pool);
  const r = await pool.query(`SELECT * FROM founder_weekly_plans WHERE week_start = $1`, [weekStart]);
  if (!r.rows[0]) return null;
  return rowToWeekly(r.rows[0] as Record<string, unknown>);
}

export async function upsertWeeklyPlan(
  pool: pg.Pool,
  userId: string,
  input: {
    weekStart: string;
    monthKey?: string;
    founderFocus: string;
    canWait: string[];
    delegate: DelegateLane[];
    observeOnly: ObserveOnlyFlag[];
  },
): Promise<WeeklyPlanRecord> {
  await ensureFounderCoachTablesReady(pool);
  if (input.canWait.length > 3) throw new Error("Can Wait is capped at 3 items");
  const id = `fwp-${input.weekStart}`;
  await pool.query(
    `INSERT INTO founder_weekly_plans (id, week_start, month_key, founder_focus, can_wait, delegate, observe_only, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (week_start) DO UPDATE SET
       month_key = EXCLUDED.month_key,
       founder_focus = EXCLUDED.founder_focus,
       can_wait = EXCLUDED.can_wait,
       delegate = EXCLUDED.delegate,
       observe_only = EXCLUDED.observe_only,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [
      id,
      input.weekStart,
      input.monthKey ?? null,
      input.founderFocus.slice(0, 800),
      JSON.stringify(input.canWait.slice(0, 3)),
      JSON.stringify(input.delegate.slice(0, 8)),
      JSON.stringify(input.observeOnly.slice(0, 8)),
      userId,
    ],
  );
  return (await getWeeklyPlan(pool, input.weekStart))!;
}

export async function getWeeklyActuals(pool: pg.Pool, weekStart: string): Promise<WeeklyActualsRecord | null> {
  await ensureFounderCoachTablesReady(pool);
  const r = await pool.query(`SELECT * FROM founder_weekly_actuals WHERE week_start = $1`, [weekStart]);
  if (!r.rows[0]) return null;
  return rowToActuals(r.rows[0] as Record<string, unknown>);
}

export async function upsertWeeklyActuals(
  pool: pg.Pool,
  userId: string,
  weekStart: string,
  patch: Partial<Omit<WeeklyActualsRecord, "weekStart" | "updatedAt">>,
): Promise<WeeklyActualsRecord> {
  await ensureFounderCoachTablesReady(pool);
  const existing = await getWeeklyActuals(pool, weekStart);
  const merged = {
    adsTxCpa: patch.adsTxCpa !== undefined ? patch.adsTxCpa : (existing?.adsTxCpa ?? null),
    adsTxConversions:
      patch.adsTxConversions !== undefined ? patch.adsTxConversions : (existing?.adsTxConversions ?? null),
    adsCampaignEdits:
      patch.adsCampaignEdits !== undefined ? patch.adsCampaignEdits : (existing?.adsCampaignEdits ?? 0),
    indiaGrantsIdentified:
      patch.indiaGrantsIdentified !== undefined
        ? patch.indiaGrantsIdentified
        : (existing?.indiaGrantsIdentified ?? null),
    indiaApplicationsSubmitted:
      patch.indiaApplicationsSubmitted !== undefined
        ? patch.indiaApplicationsSubmitted
        : (existing?.indiaApplicationsSubmitted ?? null),
    usIntroContacted:
      patch.usIntroContacted !== undefined ? patch.usIntroContacted : (existing?.usIntroContacted ?? null),
    usIntroReplied: patch.usIntroReplied !== undefined ? patch.usIntroReplied : (existing?.usIntroReplied ?? null),
    usIntroMeetings:
      patch.usIntroMeetings !== undefined ? patch.usIntroMeetings : (existing?.usIntroMeetings ?? null),
    notes: patch.notes !== undefined ? patch.notes : (existing?.notes ?? null),
  };
  const id = `fwa-${weekStart}`;
  await pool.query(
    `INSERT INTO founder_weekly_actuals (
       id, week_start, ads_tx_cpa, ads_tx_conversions, ads_campaign_edits,
       india_grants_identified, india_applications_submitted,
       us_intro_contacted, us_intro_replied, us_intro_meetings, notes, updated_by
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (week_start) DO UPDATE SET
       ads_tx_cpa = EXCLUDED.ads_tx_cpa,
       ads_tx_conversions = EXCLUDED.ads_tx_conversions,
       ads_campaign_edits = EXCLUDED.ads_campaign_edits,
       india_grants_identified = EXCLUDED.india_grants_identified,
       india_applications_submitted = EXCLUDED.india_applications_submitted,
       us_intro_contacted = EXCLUDED.us_intro_contacted,
       us_intro_replied = EXCLUDED.us_intro_replied,
       us_intro_meetings = EXCLUDED.us_intro_meetings,
       notes = EXCLUDED.notes,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [
      id,
      weekStart,
      merged.adsTxCpa,
      merged.adsTxConversions,
      merged.adsCampaignEdits,
      merged.indiaGrantsIdentified,
      merged.indiaApplicationsSubmitted,
      merged.usIntroContacted,
      merged.usIntroReplied,
      merged.usIntroMeetings,
      merged.notes?.slice(0, 2000) ?? null,
      userId,
    ],
  );
  return (await getWeeklyActuals(pool, weekStart))!;
}

export async function logObserveEvent(
  pool: pg.Pool,
  userId: string,
  weekStart: string,
  observeId: string,
  note: string,
): Promise<void> {
  await ensureFounderCoachTablesReady(pool);
  await pool.query(
    `INSERT INTO founder_observe_events (id, week_start, observe_id, user_id, note) VALUES ($1,$2,$3,$4,$5)`,
    [`foe-${randomUUID()}`, weekStart, observeId, userId, note.slice(0, 500)],
  );
  const actuals = await getWeeklyActuals(pool, weekStart);
  const edits = (actuals?.adsCampaignEdits ?? 0) + 1;
  await upsertWeeklyActuals(pool, userId, weekStart, { adsCampaignEdits: edits });
}

async function collectPortalSignals(pool: pg.Pool): Promise<PortalSignals> {
  await ensureFounderCoachTablesReady(pool);
  const { ensureTaskTablesReady } = await import("./task-service.js");
  await ensureTaskTablesReady(pool);
  const today = istDateLabel(new Date());

  const openReviews = await pool.query(
    `SELECT COUNT(*)::int AS c FROM chat_reviews WHERE status = 'open' AND review_date = $1`,
    [today],
  );
  const handoffs = await pool.query(
    `SELECT COUNT(*)::int AS c FROM shift_handoffs WHERE handoff_date = $1`,
    [today],
  );
  const overdue = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_tasks WHERE status = 'overdue'`,
  );
  const dueToday = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'done')::int AS done
     FROM siya_tasks WHERE due_date = $1::date`,
    [today],
  );

  return {
    openChatReviews: openReviews.rows[0]?.c ?? 0,
    shiftHandoffsToday: handoffs.rows[0]?.c ?? 0,
    overdueTasks: overdue.rows[0]?.c ?? 0,
    tasksDueToday: dueToday.rows[0]?.total ?? 0,
    tasksDoneToday: dueToday.rows[0]?.done ?? 0,
  };
}

function buildDriftFlags(opts: {
  weeklyPlan: WeeklyPlanRecord | null;
  actuals: WeeklyActualsRecord | null;
  priorActuals: WeeklyActualsRecord | null;
  monthlyPlan: MonthlyPlanRecord | null;
  observeEventCount: number;
}): DriftFlag[] {
  const flags: DriftFlag[] = [];
  const now = new Date().toISOString();

  const txObserve = opts.weeklyPlan?.observeOnly.find(
    (o) => /tx|adhd|ads/i.test(o.lane) || /tx|adhd|ads/i.test(o.instruction),
  );
  const campaignEdits = opts.actuals?.adsCampaignEdits ?? 0;
  const observeEvents = opts.observeEventCount;

  if (txObserve && (campaignEdits > 0 || observeEvents > 0)) {
    const total = campaignEdits + observeEvents;
    flags.push({
      id: "observe-tx-ads-edited",
      message: `You marked TX/ADHD ads as observe-only (“${txObserve.instruction.slice(0, 80)}…”); ${total} campaign change${total === 1 ? "" : "s"} logged this week — intentional?`,
      confidence: "high",
      evidence: [
        { id: "weekly.observe_only", label: `Observe flag: ${txObserve.lane}` },
        { id: "actuals.ads_campaign_edits", label: `${campaignEdits} edit(s) in weekly actuals` },
        ...(observeEvents
          ? [{ id: "observe_events", label: `${observeEvents} observe-only log entr${observeEvents === 1 ? "y" : "ies"}` }]
          : []),
      ],
      updatedAt: now,
      triggeredBy: "weeklyPlan.observeOnly + actuals.adsCampaignEdits",
    });
  }

  if (opts.weeklyPlan && !opts.weeklyPlan.founderFocus.trim()) {
    flags.push({
      id: "missing-founder-focus",
      message: "No Founder Focus set for this week — the brief should name one decision, not a list.",
      confidence: "medium",
      evidence: [{ id: "weekly.founder_focus", label: "Empty founder_focus field" }],
      updatedAt: now,
      triggeredBy: "weeklyPlan.founderFocus empty",
    });
  }

  if (opts.weeklyPlan && opts.weeklyPlan.canWait.length > 3) {
    flags.push({
      id: "can-wait-over-cap",
      message: `Can Wait has ${opts.weeklyPlan.canWait.length} items; cap is 3.`,
      confidence: "high",
      evidence: [{ id: "weekly.can_wait", label: `${opts.weeklyPlan.canWait.length} items` }],
      updatedAt: now,
      triggeredBy: "weeklyPlan.canWait.length > 3",
    });
  }

  if (opts.monthlyPlan?.reviewTriggers?.length && opts.actuals && opts.priorActuals) {
    for (const trig of opts.monthlyPlan.reviewTriggers) {
      if (
        trig.metricKey === "ads_tx_cpa" &&
        trig.thresholdPct &&
        opts.actuals.adsTxCpa != null &&
        opts.priorActuals.adsTxCpa != null
      ) {
        const prior = opts.priorActuals.adsTxCpa;
        const curr = opts.actuals.adsTxCpa;
        if (prior > 0) {
          const risePct = ((curr - prior) / prior) * 100;
          if (risePct >= trig.thresholdPct) {
            flags.push({
              id: `trigger-${trig.id}`,
              message: `Review trigger fired: ${trig.text} (CPA ${prior} → ${curr}, +${Math.round(risePct)}%).`,
              confidence: "high",
              evidence: [
                { id: "monthly.review_triggers", label: trig.text },
                { id: "actuals.ads_tx_cpa", label: `This week ${curr}, prior week ${prior}` },
              ],
              updatedAt: now,
              triggeredBy: `monthlyPlan.reviewTriggers[${trig.id}]`,
            });
          }
        }
      }
    }
  }

  return flags;
}

export async function buildFounderCoachBrief(
  pool: pg.Pool,
  user: { email: string; role: string },
): Promise<FounderCoachBriefPayload> {
  await ensureFounderCoachTablesReady(pool);
  const weekStart = istWeekStart();
  const monthKey = istDateLabel(new Date()).slice(0, 7);
  const priorWeek = addDaysIso(weekStart, -7);

  let monthlyPlan = await getMonthlyPlan(pool, monthKey);
  let weeklyPlan = await getWeeklyPlan(pool, weekStart);
  const actuals = await getWeeklyActuals(pool, weekStart);
  const priorWeekActuals = await getWeeklyActuals(pool, priorWeek);

  const canEdit = isExecutiveUser(user.email, user.role);

  if (!monthlyPlan && canEdit) {
    monthlyPlan = {
      monthKey,
      northStar: "",
      timeBudget: { clinical: 50, usFundraising: 20, indiaAmcare: 20, other: 10 },
      outcomes: [],
      notDoing: DEFAULT_NOT_DOING,
      reviewTriggers: [
        {
          id: "tx-cpa-rise",
          text: "If TX CPA rises 30% week-over-week, pause new creative",
          metricKey: "ads_tx_cpa",
          thresholdPct: 30,
          weeks: 1,
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  if (!weeklyPlan && canEdit && monthlyPlan) {
    weeklyPlan = {
      weekStart,
      monthKey,
      founderFocus: "",
      canWait: monthlyPlan.notDoing.slice(0, 3),
      delegate: [
        { lane: "India (Amcare) pipeline", ownerName: "Founder", note: "Grants/schemes + applications" },
        { lane: "US intro list", ownerName: "Founder", note: "Contact → reply → meeting" },
        { lane: "TX/ADHD ads", ownerName: "Founder", note: "Observe unless trigger fires" },
      ],
      observeOnly: [
        {
          id: "tx-adhd-ads",
          lane: "TX/ADHD ads",
          instruction: "Watch performance; do not change campaigns unless review trigger fires",
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  const portalSignals = await collectPortalSignals(pool);

  const observeEvents = await pool.query(
    `SELECT COUNT(*)::int AS c FROM founder_observe_events WHERE week_start = $1`,
    [weekStart],
  );
  const observeEventCount = observeEvents.rows[0]?.c ?? 0;

  const driftFlags = buildDriftFlags({
    weeklyPlan,
    actuals,
    priorActuals: priorWeekActuals,
    monthlyPlan,
    observeEventCount,
  });

  if (portalSignals.openChatReviews >= 5) {
    driftFlags.push({
      id: "open-chat-reviews-high",
      message: `${portalSignals.openChatReviews} open chat review items today — clinical QC backlog may need a focus block.`,
      confidence: "medium",
      evidence: [{ id: "portal.open_chat_reviews", label: `${portalSignals.openChatReviews} open (IST today)` }],
      updatedAt: new Date().toISOString(),
      triggeredBy: "portalSignals.openChatReviews >= 5",
    });
  }

  return {
    phase: 1,
    statusLabel: "in_progress",
    generatedAt: new Date().toISOString(),
    weekStart,
    monthKey,
    monthlyPlan,
    weeklyPlan,
    actuals,
    priorWeekActuals,
    portalSignals,
    driftFlags,
    canEditMonthly: canEdit,
    canEditWeekly: canEdit,
  };
}
