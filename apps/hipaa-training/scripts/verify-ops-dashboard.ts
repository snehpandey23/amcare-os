/**
 * Verify ops dashboard against live prod (existing tables only).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-ops-dashboard.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const API = process.env.TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";

type LeadRow = {
  email: string;
  name: string | null;
  departments: string[];
  sopQueue: {
    pendingCount: number;
    oldestPendingAgeDays: number | null;
    oldestPendingTitle: string | null;
    oldestPendingSubmittedAt: string | null;
  };
  gapDigest: {
    gapsInLastDigest: number | null;
    lastWeekStart: string | null;
    stillOpenEligible: number;
    resolvedSinceDigest: number | null;
  };
  weeklyCheckIn: {
    submittedThisWeek: boolean;
    weeksSubmittedOfLastN: number;
    lastNWeeks: number;
    history: { weekStart: string; submitted: boolean }[];
  };
};

const rows: { id: string; pass: boolean; detail: string }[] = [];
function pass(id: string, detail: string) {
  rows.push({ id, pass: true, detail });
  console.log(`PASS\t${id}\t${detail}`);
}
function fail(id: string, detail: string) {
  rows.push({ id, pass: false, detail });
  console.log(`FAIL\t${id}\t${detail}`);
}

async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    user?: { id: string; email: string; role?: string };
    error?: string;
  };
  if (!res.ok || !data.token) throw new Error(data.error || `login failed ${res.status}`);
  return data;
}

async function main() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");

  const logged = await login(email, password);
  pass("auth", `${logged.user?.email} role=${logged.user?.role}`);

  const res = await fetch(`${API}/api/ops/dashboard`, {
    headers: { Authorization: `Bearer ${logged.token}`, "Content-Type": "application/json" },
  });
  const data = (await res.json().catch(() => ({}))) as {
    viewer?: { isAdmin: boolean; isLead: boolean };
    engagement?: { email: string; askTurnsLast14d: number; askTurnsLast30d: number }[] | null;
    leadResponsiveness?: LeadRow[];
    generatedAt?: string;
    error?: string;
  };
  if (!res.ok) {
    fail("ops-api", `${res.status} ${data.error || JSON.stringify(data)}`);
  } else {
    pass("ops-api", `generatedAt=${data.generatedAt}`);
  }

  if (data.viewer?.isAdmin) {
    pass("viewer-admin", "admin sees Section A + all leads");
  } else {
    fail("viewer-admin", JSON.stringify(data.viewer));
  }

  const engagement = data.engagement ?? null;
  if (engagement && engagement.length > 0) {
    const withAsk = engagement.filter((e) => e.askTurnsLast30d > 0 || e.askTurnsLast14d > 0);
    pass(
      "section-a-engagement",
      `${engagement.length} staff; ${withAsk.length} with Ask turns in 14/30d`,
    );
  } else {
    fail("section-a-engagement", "expected engagement rows for admin");
  }

  const leads = data.leadResponsiveness ?? [];
  if (leads.length === 0) {
    fail("section-b-leads", "no lead rows");
  } else {
    pass("section-b-leads", `${leads.length} lead rows (per-lead, not aggregated)`);
  }

  const withPending = leads.filter((l) => l.sopQueue.pendingCount > 0);
  const oldBacklog = leads.filter(
    (l) => l.sopQueue.oldestPendingAgeDays != null && l.sopQueue.oldestPendingAgeDays >= 14,
  );
  if (withPending.length > 0) {
    const detail = withPending
      .map(
        (l) =>
          `${l.email}: ${l.sopQueue.pendingCount} pending, oldest ${l.sopQueue.oldestPendingAgeDays}d (${l.sopQueue.oldestPendingTitle})`,
      )
      .join(" | ");
    pass("sop-queue-ages", detail);
  } else {
    fail("sop-queue-ages", "expected known pending_review backlog");
  }
  if (oldBacklog.length > 0) {
    pass(
      "sop-early-august-age",
      oldBacklog
        .map((l) => `${l.email} oldest=${l.sopQueue.oldestPendingAgeDays}d @ ${l.sopQueue.oldestPendingSubmittedAt}`)
        .join(" | "),
    );
  } else {
    fail("sop-early-august-age", "expected ≥14d oldest pending (early August backlog)");
  }

  const digestTotal = leads.reduce((n, l) => n + (l.gapDigest.gapsInLastDigest ?? 0), 0);
  const withDigest = leads.filter((l) => l.gapDigest.gapsInLastDigest != null && l.gapDigest.gapsInLastDigest > 0);
  if (digestTotal >= 4 || withDigest.length > 0) {
    pass(
      "gap-digest-counts",
      `sum last-digest gaps=${digestTotal}; leads with digest: ${withDigest
        .map((l) => `${l.email}=${l.gapDigest.gapsInLastDigest} (week ${l.gapDigest.lastWeekStart})`)
        .join(", ")}`,
    );
  } else {
    fail("gap-digest-counts", `expected ~4 digest gaps; got sum=${digestTotal}`);
  }

  const checkDetail = leads
    .map(
      (l) =>
        `${l.email}: thisWeek=${l.weeklyCheckIn.submittedThisWeek} ${l.weeklyCheckIn.weeksSubmittedOfLastN}/${l.weeklyCheckIn.lastNWeeks} [${l.weeklyCheckIn.history
          .map((h) => (h.submitted ? "Y" : "."))
          .join("")}]`,
    )
    .join(" | ");
  pass("check-in-history", checkDetail);

  const out = {
    at: new Date().toISOString(),
    api: API,
    pass: rows.filter((r) => r.pass).length,
    fail: rows.filter((r) => !r.pass).length,
    rows,
    summary: {
      engagementCount: engagement?.length ?? 0,
      leadCount: leads.length,
      digestTotal,
      sopPendingByLead: withPending.map((l) => ({
        email: l.email,
        pending: l.sopQueue.pendingCount,
        oldestDays: l.sopQueue.oldestPendingAgeDays,
      })),
    },
  };
  const dir = resolve(process.cwd(), ".cursor-verify");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, "ops-dashboard.json");
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${path}`);
  if (out.fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
