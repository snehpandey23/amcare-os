/**
 * Founder ops dashboard — aggregates existing tracked data only.
 * Section A: staff engagement (admin). Section B: lead responsiveness (admin + own lead).
 */
import type pg from "pg";
import { summarizeLevelUpProgress, drillCount, type DrillKey } from "./summarize-progress.js";
import { getUserUsageStats } from "./team-weekday-service.js";
import { istWeekStart } from "./ops-coordination-service.js";
import { listDepartmentLeads, listSops, listMyLeadDepartments } from "./sop-service.js";

const ALL_DRILLS: DrillKey[] = [
  "english",
  "trivia",
  "healthterm",
  "compliance",
  "documentation",
  "map",
  "timezone",
  "typing",
  "billing",
];

function daysBetween(isoA: string, isoB = new Date().toISOString()): number {
  const a = Date.parse(isoA);
  const b = Date.parse(isoB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.floor((b - a) / (24 * 60 * 60 * 1000)));
}

function weekStartsBack(n: number, from = istWeekStart()): string[] {
  const out: string[] = [];
  const [y, m, d] = from.split("-").map(Number);
  const cal = new Date(Date.UTC(y!, m! - 1, d!));
  for (let i = 0; i < n; i++) {
    const copy = new Date(cal);
    copy.setUTCDate(copy.getUTCDate() - i * 7);
    out.push(copy.toISOString().slice(0, 10));
  }
  return out;
}

function practiceShareThisWeek(dayLedger: unknown[]): {
  optedInShared: boolean;
  drillDaysActive: number;
  drillDaysShared: number;
  weekStart: string;
  weekEnd: string;
} {
  // Align with WeeklyPracticeReportView (UTC Monday week).
  const anchor = new Date().toISOString().slice(0, 10);
  const d = new Date(`${anchor}T12:00:00.000Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  const weekStart = d.toISOString().slice(0, 10);
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 6);
  const weekEnd = end.toISOString().slice(0, 10);
  const entries = (Array.isArray(dayLedger) ? dayLedger : []).filter((row) => {
    if (!row || typeof row !== "object") return false;
    const date = String((row as { date?: string }).date || "");
    return date >= weekStart && date <= weekEnd;
  });
  const shared = entries.filter((e) => (e as { shareDecision?: string }).shareDecision === "yes");
  const activeDays = new Set(entries.map((e) => String((e as { date: string }).date)));
  const sharedDays = new Set(shared.map((e) => String((e as { date: string }).date)));
  return {
    optedInShared: shared.length > 0,
    drillDaysActive: activeDays.size,
    drillDaysShared: sharedDays.size,
    weekStart,
    weekEnd,
  };
}

export type OpsEngagementRow = {
  userId: string;
  email: string;
  name: string | null;
  askTurnsLast14d: number;
  askTurnsLast30d: number;
  usageSegment: string;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  practiceLifetime: number;
  /** Raw day ledger so UI can reuse WeeklyPracticeReportView (shared results only). */
  dayLedger: unknown[];
  practiceShareThisWeek: {
    optedInShared: boolean;
    drillDaysActive: number;
    drillDaysShared: number;
    weekStart: string;
    weekEnd: string;
  };
};

export type OpsLeadResponsivenessRow = {
  userId: string;
  email: string;
  name: string | null;
  departments: string[];
  sopQueue: {
    pendingCount: number;
    oldestPendingTitle: string | null;
    oldestPendingAgeDays: number | null;
    oldestPendingSubmittedAt: string | null;
  };
  gapDigest: {
    lastWeekStart: string | null;
    lastSentAt: string | null;
    gapsInLastDigest: number | null;
    stillOpenEligible: number;
    resolvedSinceDigest: number | null;
    avgResolveDaysLast30d: number | null;
  };
  weeklyCheckIn: {
    submittedThisWeek: boolean;
    thisWeekStart: string;
    weeksSubmittedOfLastN: number;
    lastNWeeks: number;
    history: { weekStart: string; submitted: boolean }[];
  };
};

export async function buildOpsDashboard(
  pool: pg.Pool,
  opts: { viewerUserId: string; viewerRole: string },
): Promise<{
  viewer: { isAdmin: boolean; isLead: boolean };
  engagement: OpsEngagementRow[] | null;
  leadResponsiveness: OpsLeadResponsivenessRow[];
  /** B2 · Recurring knowledge gaps (surface only — no auto-draft). */
  recurringGapPatterns: import("./assist-telemetry.js").RecurringGapPattern[];
  /** Volume-only (≥3 open) without ≥2 known reporters. */
  volumeGapPatternsUnknownPeople: import("./assist-telemetry.js").RecurringGapPattern[];
  /** Admin-only: team Zocdoc duplicate cluster for human consolidation. */
  founderSopConsolidationFlags: import("./sop-service.js").FounderSopConsolidationFlag[];
  coverageGaps: import("./shift-roster-service.js").CoverageGapWindow[];
  scheduledVsActual: import("./shift-roster-service.js").ScheduledVsActualRow[];
  rosterDate: string;
  generatedAt: string;
}> {
  const { ensureAssistTelemetryTables, listRecurringGapPatterns, listVolumeGapPatternsUnknownPeople } =
    await import("./assist-telemetry.js");
  const { ensureOpsCoordinationTablesReady } = await import("./ops-coordination-service.js");
  const { ensureSopTables, listFounderSopConsolidationFlags, retireDuplicateSeedPacks } =
    await import("./sop-service.js");
  await Promise.all([
    ensureAssistTelemetryTables(pool),
    ensureOpsCoordinationTablesReady(pool),
    ensureSopTables(pool),
  ]);
  // Idempotent: close seed Zocdoc/Chargebacks stubs once team SOPs cover those topics.
  await retireDuplicateSeedPacks(pool);

  const isAdmin = opts.viewerRole === "admin";
  const myLeadSlugs = await listMyLeadDepartments(pool, opts.viewerUserId);
  const isLead = myLeadSlugs.length > 0;
  if (!isAdmin && !isLead) {
    throw new Error("FORBIDDEN");
  }

  let engagement: OpsEngagementRow[] | null = null;
  if (isAdmin) {
    const users = await pool.query(
      `SELECT u.id, u.email, u.name, p.level_up_json
       FROM hipaa_training_users u
       LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
       WHERE u.deactivated_at IS NULL
       ORDER BY u.name NULLS LAST, u.email ASC`,
    );
    engagement = [];
    for (const row of users.rows) {
      const usage = await getUserUsageStats(pool, row.id as string);
      const level = summarizeLevelUpProgress(row.level_up_json as Record<string, unknown>);
      const ledger = level.dayLedger as unknown[];
      engagement.push({
        userId: row.id as string,
        email: row.email as string,
        name: (row.name as string) ?? null,
        askTurnsLast14d: usage.askTurnsLast14d,
        askTurnsLast30d: usage.askTurnsLast30d,
        usageSegment: usage.segment,
        totalXp: level.totalXp,
        streak: level.streak,
        lastActiveDate: level.lastActiveDate,
        practiceLifetime: drillCount(level.lifetimeDrills, ALL_DRILLS),
        dayLedger: ledger,
        practiceShareThisWeek: practiceShareThisWeek(ledger),
      });
    }
  }

  const leads = await listDepartmentLeads(pool);
  const leadByUser = new Map<
    string,
    { userId: string; email: string; name: string | null; departments: string[]; slugs: string[] }
  >();
  for (const L of leads) {
    if (!L.userId || !L.userEmail) continue;
    // Skip admin-as-lead for "responsiveness" job view? Founder still wants to see real department leads.
    // Include all assigned leads including admins if they own a dept.
    const existing = leadByUser.get(L.userId);
    if (existing) {
      if (!existing.departments.includes(L.department)) existing.departments.push(L.department);
      if (!existing.slugs.includes(L.departmentSlug)) existing.slugs.push(L.departmentSlug);
    } else {
      leadByUser.set(L.userId, {
        userId: L.userId,
        email: L.userEmail,
        name: L.userName,
        departments: [L.department],
        slugs: [L.departmentSlug],
      });
    }
  }

  let targets = [...leadByUser.values()];
  if (!isAdmin) {
    targets = targets.filter((t) => t.userId === opts.viewerUserId);
  }

  const pendingAll = await listSops(pool, { status: "pending_review" });
  const thisWeek = istWeekStart();
  const lastN = 8;
  const weekWindow = weekStartsBack(lastN, thisWeek);

  const checkinRows = await pool.query(
    `SELECT user_id, department_slug, week_start::text AS week_start
     FROM weekly_lead_checkins
     WHERE week_start >= $1::date`,
    [weekWindow[weekWindow.length - 1]],
  );

  const digestRows = await pool.query(
    `SELECT DISTINCT ON (user_id)
       user_id, week_start::text AS week_start, gap_count, sent_at
     FROM siya_assist_gap_digest_sends
     ORDER BY user_id, week_start DESC`,
  );
  const digestByUser = new Map<
    string,
    { weekStart: string; gapCount: number; sentAt: string }
  >();
  for (const row of digestRows.rows) {
    digestByUser.set(row.user_id as string, {
      weekStart: String(row.week_start).slice(0, 10),
      gapCount: Number(row.gap_count) || 0,
      sentAt: new Date(row.sent_at as string).toISOString(),
    });
  }

  const leadResponsiveness: OpsLeadResponsivenessRow[] = [];

  for (const t of targets) {
    const pending = pendingAll.filter((s) => t.departments.includes(s.department));
    pending.sort((a, b) => {
      const aa = a.submittedAt || a.createdAt;
      const bb = b.submittedAt || b.createdAt;
      return aa.localeCompare(bb);
    });
    const oldest = pending[0];
    const oldestAt = oldest ? oldest.submittedAt || oldest.createdAt : null;

    const digest = digestByUser.get(t.userId) || null;
    const openEligible = await pool.query(
      `SELECT COUNT(*)::int AS c FROM siya_assist_gaps
       WHERE status = 'open'
         AND department_slug = ANY($1::text[])
         AND signal_type IN ('no_match', 'notify_owner')
         AND department NOT IN ('Leadership', 'General')`,
      [t.slugs],
    );
    let resolvedSince: number | null = null;
    if (digest) {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c FROM siya_assist_gaps
         WHERE status = 'resolved'
           AND department_slug = ANY($1::text[])
           AND signal_type IN ('no_match', 'notify_owner')
           AND resolved_at IS NOT NULL
           AND resolved_at >= $2::timestamptz`,
        [t.slugs, digest.sentAt],
      );
      resolvedSince = r.rows[0]?.c ?? 0;
    }
    const avgResolve = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400.0)::float AS days
       FROM siya_assist_gaps
       WHERE status = 'resolved'
         AND department_slug = ANY($1::text[])
         AND resolved_at IS NOT NULL
         AND resolved_at >= NOW() - INTERVAL '30 days'`,
      [t.slugs],
    );
    const avgDays = avgResolve.rows[0]?.days;
    const avgResolveDaysLast30d =
      typeof avgDays === "number" && Number.isFinite(avgDays) ? Math.round(avgDays * 10) / 10 : null;

    const myCheckins = checkinRows.rows.filter((r) => r.user_id === t.userId);
    const submittedWeeks = new Set(
      myCheckins.map((r) => String(r.week_start).slice(0, 10)),
    );
    const history = weekWindow.map((w) => ({
      weekStart: w,
      submitted: submittedWeeks.has(w),
    }));
    const weeksSubmittedOfLastN = history.filter((h) => h.submitted).length;

    leadResponsiveness.push({
      userId: t.userId,
      email: t.email,
      name: t.name,
      departments: t.departments,
      sopQueue: {
        pendingCount: pending.length,
        oldestPendingTitle: oldest?.title ?? null,
        oldestPendingAgeDays: oldestAt ? daysBetween(oldestAt) : null,
        oldestPendingSubmittedAt: oldestAt,
      },
      gapDigest: {
        lastWeekStart: digest?.weekStart ?? null,
        lastSentAt: digest?.sentAt ?? null,
        gapsInLastDigest: digest ? digest.gapCount : null,
        stillOpenEligible: openEligible.rows[0]?.c ?? 0,
        resolvedSinceDigest: resolvedSince,
        avgResolveDaysLast30d,
      },
      weeklyCheckIn: {
        submittedThisWeek: submittedWeeks.has(thisWeek),
        thisWeekStart: thisWeek,
        weeksSubmittedOfLastN,
        lastNWeeks: lastN,
        history,
      },
    });
  }

  leadResponsiveness.sort((a, b) => a.email.localeCompare(b.email));

  const { ensureShiftRosterTables, findCoverageGaps, buildScheduledVsActual, istDateString } = await import(
    "./shift-roster-service.js"
  );
  await ensureShiftRosterTables(pool);
  const rosterDate = istDateString();
  const coverageTo = (() => {
    const [y, m, d] = rosterDate.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d!));
    dt.setUTCDate(dt.getUTCDate() + 6);
    return dt.toISOString().slice(0, 10);
  })();

  let coverageGaps: Awaited<ReturnType<typeof findCoverageGaps>> = [];
  let scheduledVsActual: Awaited<ReturnType<typeof buildScheduledVsActual>> = [];
  if (isAdmin) {
    coverageGaps = await findCoverageGaps(pool, { fromDate: rosterDate, toDate: coverageTo });
    scheduledVsActual = await buildScheduledVsActual(pool, { rosterDate });
  } else {
    // Leads: same scheduled-vs-actual view about themselves only (transparent, not admin-only shape).
    scheduledVsActual = await buildScheduledVsActual(pool, {
      rosterDate,
      userId: opts.viewerUserId,
    });
  }

  // B2 ACL: founder/admin = all departments; leads = own lead slugs only.
  const patternScope = isAdmin ? null : myLeadSlugs;
  const [recurringGapPatterns, volumeGapPatternsUnknownPeople, founderSopConsolidationFlags] =
    await Promise.all([
      listRecurringGapPatterns(pool, { departmentSlugs: patternScope }),
      listVolumeGapPatternsUnknownPeople(pool, { departmentSlugs: patternScope }),
      isAdmin ? listFounderSopConsolidationFlags(pool) : Promise.resolve([]),
    ]);

  return {
    viewer: { isAdmin, isLead },
    engagement,
    leadResponsiveness,
    recurringGapPatterns,
    volumeGapPatternsUnknownPeople,
    founderSopConsolidationFlags,
    coverageGaps,
    scheduledVsActual,
    rosterDate,
    generatedAt: new Date().toISOString(),
  };
}
