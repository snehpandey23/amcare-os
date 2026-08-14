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
  /** Founder free-text priorities / thoughts (Phase 2) */
  prioritiesRaw: string;
  lockedAt: string | null;
  lockedBy: string | null;
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

/** Domain tabs — Phase 1b: real portal data only (no LLM financial/legal content). */
export type DomainTabId = "accounts" | "hr" | "clinical" | "marketing" | "compliance";

export type DomainItem = {
  id: string;
  label: string;
  detail?: string;
  /** ISO date YYYY-MM-DD for nearest-deadline sort; null = no deadline */
  urgencyDate: string | null;
  /** Explicit founder_should_know from weekly_lead_checkins */
  founderFlag: boolean;
  source: string;
  href?: string;
};

export type DomainCheckInSummary = {
  id: string;
  departmentLabel: string;
  weekStart: string;
  submitterName: string | null;
  whatChanged: string;
  keyNumbersStatus: string;
  blockers: string;
  founderShouldKnow: string;
  createdAt: string;
};

export type DomainSnapshot = {
  id: DomainTabId;
  title: string;
  /** live = has countable portal rows; partial = some real + gaps; not_tracked = no system of record */
  status: "live" | "partial" | "not_tracked";
  summary: string;
  items: DomainItem[];
  checkins: DomainCheckInSummary[];
  placeholders: string[];
};

export type FounderCoachBriefPayload = {
  phase: 2;
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
  domains: DomainSnapshot[];
  /**
   * Same weekly_lead_checkins rows already in domain tabs (founder_should_know / blockers /
   * weekly actuals) — flattened for "Signals this week". Not a second source.
   */
  leadCheckInSignals: DomainItem[];
  canEditMonthly: boolean;
  canEditWeekly: boolean;
  isWeekLocked: boolean;
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
    prioritiesRaw: (row.priorities_raw as string) ?? "",
    lockedAt: row.locked_at ? new Date(row.locked_at as string).toISOString() : null,
    lockedBy: (row.locked_by as string) ?? null,
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
    prioritiesRaw?: string;
  },
): Promise<WeeklyPlanRecord> {
  await ensureFounderCoachTablesReady(pool);
  const existing = await getWeeklyPlan(pool, input.weekStart);
  if (existing?.lockedAt) {
    throw new Error("This week is locked. Unlock to modify before editing.");
  }
  if (input.canWait.length > 3) throw new Error("Can Wait is capped at 3 items");
  const id = `fwp-${input.weekStart}`;
  const prioritiesRaw =
    input.prioritiesRaw !== undefined
      ? input.prioritiesRaw.slice(0, 8000)
      : (existing?.prioritiesRaw ?? "");
  await pool.query(
    `INSERT INTO founder_weekly_plans
       (id, week_start, month_key, founder_focus, can_wait, delegate, observe_only, priorities_raw, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (week_start) DO UPDATE SET
       month_key = EXCLUDED.month_key,
       founder_focus = EXCLUDED.founder_focus,
       can_wait = EXCLUDED.can_wait,
       delegate = EXCLUDED.delegate,
       observe_only = EXCLUDED.observe_only,
       priorities_raw = EXCLUDED.priorities_raw,
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
      prioritiesRaw,
      userId,
    ],
  );
  return (await getWeeklyPlan(pool, input.weekStart))!;
}

export async function lockWeeklyPlan(
  pool: pg.Pool,
  userId: string,
  weekStart: string,
): Promise<WeeklyPlanRecord> {
  await ensureFounderCoachTablesReady(pool);
  const plan = await getWeeklyPlan(pool, weekStart);
  if (!plan) throw new Error("Save this week's plan before locking.");
  if (plan.lockedAt) throw new Error("Already locked.");
  if (!plan.founderFocus.trim() && !plan.prioritiesRaw.trim()) {
    throw new Error("Add Founder Focus or priorities before locking.");
  }
  const snapshot = {
    weekStart: plan.weekStart,
    monthKey: plan.monthKey,
    prioritiesRaw: plan.prioritiesRaw,
    founderFocus: plan.founderFocus,
    canWait: plan.canWait,
    delegate: plan.delegate,
    observeOnly: plan.observeOnly,
    lockedAt: new Date().toISOString(),
  };
  await pool.query(
    `UPDATE founder_weekly_plans
     SET locked_at = NOW(), locked_by = $2, locked_snapshot = $3::jsonb, updated_by = $2, updated_at = NOW()
     WHERE week_start = $1`,
    [weekStart, userId, JSON.stringify(snapshot)],
  );
  return (await getWeeklyPlan(pool, weekStart))!;
}

export async function unlockWeeklyPlan(
  pool: pg.Pool,
  userId: string,
  weekStart: string,
): Promise<WeeklyPlanRecord> {
  await ensureFounderCoachTablesReady(pool);
  const plan = await getWeeklyPlan(pool, weekStart);
  if (!plan) throw new Error("No plan for this week.");
  if (!plan.lockedAt) throw new Error("Week is not locked.");
  await pool.query(
    `UPDATE founder_weekly_plans
     SET locked_at = NULL, locked_by = NULL, updated_by = $2, updated_at = NOW()
     WHERE week_start = $1`,
    [weekStart, userId],
  );
  return (await getWeeklyPlan(pool, weekStart))!;
}

/** Flatten Phase 1 domain items that came from weekly_lead_checkins (single source). */
export function leadCheckInSignalsFromDomains(domains: DomainSnapshot[]): DomainItem[] {
  return sortDomainItems(
    domains.flatMap((d) => d.items.filter((i) => i.source.startsWith("weekly_lead_checkins"))),
  );
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

function sortDomainItems(items: DomainItem[]): DomainItem[] {
  return [...items].sort((a, b) => {
    if (a.founderFlag !== b.founderFlag) return a.founderFlag ? -1 : 1;
    if (a.urgencyDate && b.urgencyDate) return a.urgencyDate.localeCompare(b.urgencyDate);
    if (a.urgencyDate) return -1;
    if (b.urgencyDate) return 1;
    return a.label.localeCompare(b.label);
  });
}

function checkinsToItems(checkins: DomainCheckInSummary[]): DomainItem[] {
  const items: DomainItem[] = [];
  for (const c of checkins) {
    const weekEnd = addDaysIso(c.weekStart, 6);
    if (c.founderShouldKnow.trim()) {
      items.push({
        id: `${c.id}-founder`,
        label: `Founder should know — ${c.departmentLabel}`,
        detail: c.founderShouldKnow.trim().slice(0, 500),
        urgencyDate: weekEnd,
        founderFlag: true,
        source: "weekly_lead_checkins.founder_should_know",
        href: "/team",
      });
    }
    if (c.blockers.trim()) {
      items.push({
        id: `${c.id}-block`,
        label: `Blocking — ${c.departmentLabel}`,
        detail: c.blockers.trim().slice(0, 500),
        urgencyDate: weekEnd,
        founderFlag: false,
        source: "weekly_lead_checkins.blockers",
        href: "/team",
      });
    }
    if (c.whatChanged.trim() || c.keyNumbersStatus.trim()) {
      items.push({
        id: `${c.id}-week`,
        label: `Weekly actuals — ${c.departmentLabel}`,
        detail: [c.whatChanged.trim(), c.keyNumbersStatus.trim()].filter(Boolean).join(" · ").slice(0, 500),
        urgencyDate: weekEnd,
        founderFlag: false,
        source: "weekly_lead_checkins",
        href: "/team",
      });
    }
  }
  return items;
}

async function loadWeekCheckins(
  pool: pg.Pool,
  weekStart: string,
  departmentLabel: string,
): Promise<DomainCheckInSummary[]> {
  const { ensureOpsCoordinationTablesReady } = await import("./ops-coordination-service.js");
  await ensureOpsCoordinationTablesReady(pool);
  const { departmentToSlug } = await import("./sop-store.js");
  const slug = departmentToSlug(departmentLabel);
  const r = await pool.query(
    `SELECT c.*, u.name AS user_name
     FROM weekly_lead_checkins c
     JOIN hipaa_training_users u ON u.id = c.user_id
     WHERE c.week_start = $1 AND c.department_slug = $2
     ORDER BY c.created_at DESC
     LIMIT 20`,
    [weekStart, slug],
  );
  return r.rows.map((row) => ({
    id: row.id as string,
    departmentLabel: String(row.department_label ?? departmentLabel),
    weekStart: new Date(row.week_start as string).toISOString().slice(0, 10),
    submitterName: (row.user_name as string) ?? null,
    whatChanged: String(row.what_changed ?? ""),
    keyNumbersStatus: String(row.key_numbers_status ?? ""),
    blockers: String(row.blockers ?? ""),
    founderShouldKnow: String(row.founder_should_know ?? ""),
    createdAt: new Date(row.created_at as string).toISOString(),
  }));
}

/** Audit-backed domain tabs — only structured portal rows; never invented finance/legal. */
export async function collectDomainSnapshots(
  pool: pg.Pool,
  weekStart: string,
  actuals: WeeklyActualsRecord | null,
): Promise<DomainSnapshot[]> {
  const { ensureSopTables } = await import("./sop-service.js");
  await ensureSopTables(pool);
  const { ensureOpsCoordinationTablesReady } = await import("./ops-coordination-service.js");
  await ensureOpsCoordinationTablesReady(pool);
  const today = istDateLabel(new Date());

  // —— Accounts: no ledger / CPA deadline tables ——
  const accounts: DomainSnapshot = {
    id: "accounts",
    title: "Accounts",
    status: "not_tracked",
    summary: "No financial ledger or founder/CPA deadline store in the portal yet.",
    items: [],
    checkins: [],
    placeholders: [
      "Cash, AR/AP, refunds, and chargeback metrics are not tracked in Siya OS",
      "CPOM / tax / legal compliance guidance is out of scope here — never AI-generated",
      "Founder/CPA-confirmed deadlines: none configured (section stays empty until added)",
    ],
  };

  // —— HR: users + department leads ——
  const userStats = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE deactivated_at IS NULL)::int AS active,
       COUNT(*) FILTER (WHERE deactivated_at IS NULL AND role = 'admin')::int AS admins,
       COUNT(*) FILTER (WHERE deactivated_at IS NULL AND last_login_at IS NOT NULL
         AND last_login_at > NOW() - INTERVAL '7 days')::int AS active_7d
     FROM hipaa_training_users`,
  );
  const leads = await pool.query(
    `SELECT l.department_label, l.department_slug, u.name, u.email
     FROM siya_department_leads l
     LEFT JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
     ORDER BY l.department_label ASC`,
  );
  const hrItems: DomainItem[] = [
    {
      id: "hr-active",
      label: `${userStats.rows[0]?.active ?? 0} active portal users`,
      detail: `${userStats.rows[0]?.admins ?? 0} admins · ${userStats.rows[0]?.active_7d ?? 0} logged in last 7 days`,
      urgencyDate: null,
      founderFlag: false,
      source: "hipaa_training_users",
      href: "/admin/team",
    },
  ];
  const unassignedLeads = leads.rows.filter((r) => !r.email);
  const assignedLeads = leads.rows.filter((r) => r.email);
  for (const row of assignedLeads) {
    hrItems.push({
      id: `hr-lead-${row.department_slug}`,
      label: `${row.department_label} lead: ${row.name || row.email}`,
      urgencyDate: null,
      founderFlag: false,
      source: "siya_department_leads",
      href: "/admin/team",
    });
  }
  if (unassignedLeads.length) {
    hrItems.push({
      id: "hr-leads-open",
      label: `${unassignedLeads.length} department lead seat${unassignedLeads.length === 1 ? "" : "s"} unassigned`,
      detail: unassignedLeads.map((r) => r.department_label).join(", "),
      urgencyDate: today,
      founderFlag: false,
      source: "siya_department_leads",
      href: "/admin/team",
    });
  }
  const hr: DomainSnapshot = {
    id: "hr",
    title: "HR",
    status: "live",
    summary: "Workforce roster and department SOP leads from the staff portal.",
    items: sortDomainItems(hrItems),
    checkins: [],
    placeholders: [
      "PTO / leave balances not tracked",
      "Hiring pipeline / ATS not connected",
      "Performance reviews not tracked",
    ],
  };

  // —— Clinical: chat reviews, handoffs, training start, check-ins ——
  const clinicalCheckins = await loadWeekCheckins(pool, weekStart, "Clinical Operations");
  const openReviews = await pool.query(
    `SELECT COUNT(*)::int AS c FROM chat_reviews WHERE status = 'open' AND review_date = $1`,
    [today],
  );
  const handoffs = await pool.query(
    `SELECT COUNT(*)::int AS c FROM shift_handoffs WHERE handoff_date = $1`,
    [today],
  );
  const trainingRows = await pool.query(
    `SELECT p.progress_json
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE u.deactivated_at IS NULL`,
  );
  let trainingNotStarted = 0;
  for (const row of trainingRows.rows) {
    const pj = (row.progress_json ?? {}) as { modulesCompleted?: string[] };
    const done = Array.isArray(pj.modulesCompleted) ? pj.modulesCompleted.length : 0;
    if (done < 1) trainingNotStarted += 1;
  }
  const clinicalItems: DomainItem[] = [
    {
      id: "clin-reviews",
      label: `${openReviews.rows[0]?.c ?? 0} open chat reviews (IST today)`,
      urgencyDate: (openReviews.rows[0]?.c ?? 0) > 0 ? today : null,
      founderFlag: false,
      source: "chat_reviews",
      href: "/chat-review",
    },
    {
      id: "clin-handoffs",
      label: `${handoffs.rows[0]?.c ?? 0} shift handoffs today`,
      urgencyDate: null,
      founderFlag: false,
      source: "shift_handoffs",
      href: "/team",
    },
    {
      id: "clin-hipaa",
      label: `${trainingNotStarted} active users with HIPAA training not started`,
      detail: "Counted from portal progress (modulesCompleted empty)",
      urgencyDate: trainingNotStarted > 0 ? today : null,
      founderFlag: false,
      source: "hipaa_training_progress",
      href: "/admin/team",
    },
    ...checkinsToItems(clinicalCheckins),
  ];
  const clinical: DomainSnapshot = {
    id: "clinical",
    title: "Clinical",
    status: clinicalCheckins.length ? "live" : "partial",
    summary: "Ops QC, handoffs, training starts, and Clinical Operations weekly check-ins.",
    items: sortDomainItems(clinicalItems),
    checkins: clinicalCheckins,
    placeholders: [
      "Clinical incident / adverse-event tracking is not a portal table (policy text only)",
      "Patient volume / booking counts not connected",
    ],
  };

  // —— Marketing: weekly check-ins + optional founder-entered ads actuals ——
  const marketingCheckins = await loadWeekCheckins(pool, weekStart, "Marketing");
  const marketingItems: DomainItem[] = [...checkinsToItems(marketingCheckins)];
  if (actuals && (actuals.adsTxCpa != null || actuals.adsTxConversions != null)) {
    marketingItems.push({
      id: "mkt-ads-manual",
      label: "Founder-entered TX/ADHD ads metrics (this week)",
      detail: [
        actuals.adsTxCpa != null ? `CPA ${actuals.adsTxCpa}` : null,
        actuals.adsTxConversions != null ? `${actuals.adsTxConversions} conversions` : null,
        actuals.adsCampaignEdits ? `${actuals.adsCampaignEdits} campaign edits logged` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      urgencyDate: addDaysIso(weekStart, 6),
      founderFlag: false,
      source: "founder_weekly_actuals",
    });
  }
  const marketing: DomainSnapshot = {
    id: "marketing",
    title: "Marketing",
    status: marketingCheckins.length || marketingItems.length ? "live" : "partial",
    summary: marketingCheckins.length
      ? "Weekly lead check-in is the source of truth for this week’s marketing actuals."
      : "No Marketing weekly check-in filed yet this week.",
    items: sortDomainItems(marketingItems),
    checkins: marketingCheckins,
    placeholders: [
      "Google Ads / GA4 live pull not connected — only check-ins and founder-entered actuals",
      "Review/rating feeds not connected",
    ],
  };

  // —— Compliance: check-ins + SOP queue + training ——
  // SOP pending signal = founder-routed only (no lead / Leadership / General).
  // Lead self-approve departments are intentionally absent from Founder Coach.
  const complianceCheckins = await loadWeekCheckins(pool, weekStart, "Compliance");
  const { listFounderRoutedPendingSops } = await import("./sop-service.js");
  const founderPendingSops = await listFounderRoutedPendingSops(pool);
  const founderPendingCount = founderPendingSops.length;
  const dueReview = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sops
     WHERE status = 'live' AND review_date IS NOT NULL AND review_date <= $1::date`,
    [today],
  );
  const complianceItems: DomainItem[] = [];
  if (founderPendingCount > 0) {
    complianceItems.push({
      id: "comp-pending",
      label:
        founderPendingCount === 1
          ? "1 SOP on founder queue (no lead or company-wide)"
          : `${founderPendingCount} SOPs on founder queue (no lead or company-wide)`,
      detail: founderPendingSops
        .slice(0, 3)
        .map((s) => s.title)
        .join(" · "),
      urgencyDate: today,
      founderFlag: true,
      source: "siya_sops.founder_routed",
      href: "/admin/sop-review",
    });
  }
  complianceItems.push(
    {
      id: "comp-review-due",
      label: `${dueReview.rows[0]?.c ?? 0} live SOPs past review date`,
      urgencyDate: (dueReview.rows[0]?.c ?? 0) > 0 ? today : null,
      founderFlag: false,
      source: "siya_sops.review_date",
      href: "/memory/knowledge/sops",
    },
    {
      id: "comp-hipaa",
      label: `${trainingNotStarted} active users with HIPAA training not started`,
      urgencyDate: trainingNotStarted > 0 ? today : null,
      founderFlag: false,
      source: "hipaa_training_progress",
      href: "/admin/team",
    },
    ...checkinsToItems(complianceCheckins),
  );
  const compliance: DomainSnapshot = {
    id: "compliance",
    title: "Compliance",
    status: "partial",
    summary:
      "Founder SOP queue (unassigned / Leadership / General only), review dates, training starts, and Compliance weekly check-ins. Lead-owned pending SOPs stay with department leads.",
    items: sortDomainItems(complianceItems),
    checkins: complianceCheckins,
    placeholders: [
      "No founder/CPA-confirmed legal or tax deadline calendar in the portal",
      "CPOM / corporate-practice guidance is never generated by this coach",
      "Department SOPs with an assigned lead self-approve — not listed here",
    ],
  };

  return [accounts, hr, clinical, marketing, compliance];
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
      prioritiesRaw: "",
      lockedAt: null,
      lockedBy: null,
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

  const domains = await collectDomainSnapshots(pool, weekStart, actuals);
  const leadCheckInSignals = leadCheckInSignalsFromDomains(domains);
  const isWeekLocked = Boolean(weeklyPlan?.lockedAt);

  return {
    phase: 2,
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
    domains,
    leadCheckInSignals,
    canEditMonthly: canEdit,
    canEditWeekly: canEdit && !isWeekLocked,
    isWeekLocked,
  };
}
