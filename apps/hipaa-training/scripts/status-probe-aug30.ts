/**
 * Status probe — weekday sends, gaps, auto-capture, engagement surfaces.
 * source scripts/agent-qa-env.sh && npx tsx apps/hipaa-training/scripts/status-probe-aug30.ts
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const API = process.env.TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
const STAFF = process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app";
const email = (process.env.ASSIST_EMAIL || "").trim();
const password = (process.env.ASSIST_PASSWORD || "").trim();

async function login() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function api(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function loadCronSecret(): string | null {
  if (process.env.CRON_SECRET) return process.env.CRON_SECRET;
  if (process.env.HIPAA_TRAINING_CRON_SECRET) return process.env.HIPAA_TRAINING_CRON_SECRET;
  for (const p of [
    resolve(process.cwd(), ".env.staff-cron.tmp"),
    resolve(process.cwd(), "apps/hipaa-training/.env.local"),
    resolve(process.cwd(), "integrations/hipaa-training-api/.env.local"),
  ]) {
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, "utf8");
    const m = raw.match(/^(?:HIPAA_TRAINING_)?CRON_SECRET=(.+)$/m);
    if (m) {
      let v = m[1].trim().replace(/^["']|["']$/g, "");
      if (v && v !== "[SENSITIVE]") return v;
    }
  }
  return null;
}

async function main() {
  const token = await login();
  const out: Record<string, unknown> = { at: new Date().toISOString() };

  // Weekday send marks
  const weekdayChecks: { date: string; theme: string }[] = [
    { date: "2026-08-25", theme: "motivational_monday" },
    { date: "2026-08-26", theme: "therapeutic_tuesday" },
    { date: "2026-08-27", theme: "working_wednesday" },
    { date: "2026-08-27", theme: "thoughtful_thursday" },
    { date: "2026-08-28", theme: "feedback_friday" },
  ];
  const weekday: Record<string, unknown>[] = [];
  for (const c of weekdayChecks) {
    const r = await api(
      token,
      `/api/admin/weekday-messages/recipients?sendDate=${c.date}&theme=${c.theme}&includeAlreadySent=1`,
    );
    const recs = ((r.data as { recipients?: { email: string; alreadySent?: boolean; segment?: string }[] })
      .recipients || []);
    const sent = recs.filter((x) => x.alreadySent);
    weekday.push({
      ...c,
      http: r.status,
      recipients: recs.length,
      alreadySent: sent.length,
      sentEmails: sent.map((x) => `${x.email}[${x.segment}]`).slice(0, 12),
    });
  }
  out.weekdaySendMarks = weekday;

  // Usage API exists (Ask turn counts for segmentation — not a founder dashboard)
  const usage = await api(token, `/api/admin/weekday-messages/usage?email=vayushi@siya.health`);
  out.usageSampleVayushi = { http: usage.status, data: usage.data };

  // Roster level-up fields
  const roster = await api(token, "/api/admin/team/roster");
  const members = ((roster.data as { members?: unknown[] }).members || []) as {
    email?: string;
    levelUp?: {
      totalXp?: number;
      streak?: number;
      lastActiveDate?: string;
      chatPracticeSessions?: number;
      dayLedger?: unknown[];
    };
  }[];
  out.rosterEngagementSample = members.slice(0, 5).map((m) => ({
    email: m.email,
    xp: m.levelUp?.totalXp,
    streak: m.levelUp?.streak,
    lastActive: m.levelUp?.lastActiveDate,
    chatPracticeSessions: m.levelUp?.chatPracticeSessions,
    dayLedgerLen: Array.isArray(m.levelUp?.dayLedger) ? m.levelUp!.dayLedger!.length : 0,
  }));

  // Gaps
  const gapsRes = await api(token, "/api/assist/gaps");
  const gaps = ((gapsRes.data as { gaps?: {
    id: string;
    department: string;
    taskLabel: string;
    createdAt: string;
    signalType?: string;
  }[] }).gaps || []);
  const byDept: Record<string, number> = {};
  const bySignal: Record<string, number> = {};
  for (const g of gaps) {
    byDept[g.department] = (byDept[g.department] || 0) + 1;
    const sig = g.signalType || "unknown";
    bySignal[sig] = (bySignal[sig] || 0) + 1;
  }
  out.openGaps = {
    total: gaps.length,
    byDepartment: byDept,
    bySignalType: bySignal,
    newest10: [...gaps]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((g) => ({
        at: g.createdAt,
        dept: g.department,
        task: g.taskLabel,
        signal: g.signalType || "?",
        id: g.id,
      })),
  };

  const digest = await api(token, "/api/assist/gap-digests/preview");
  out.digestPreview = { http: digest.status, data: digest.data };

  // Auto-capture test (soft-stop) — use unique probe that is NOT synthetic auto-resolve?
  // Use a real soft-stop question; force dry_run via synthetic? User wants real DB row.
  // Synthetic probes auto-resolve. Use a non-synthetic gap question with dry_run if possible.
  // Chat API auto-persists on knowledgeGap; synthetic probes dry_run + auto-resolve.
  // For durable evidence: POST /api/assist/gaps directly as no_match for Clinical Ops, then
  // also fire chat soft-stop for General with unique text that soft-stops.
  const probeId = `gap-status-probe-${Date.now()}`;
  const insert = await api(token, "/api/assist/gaps", {
    method: "POST",
    body: JSON.stringify({
      id: probeId,
      department: "Clinical Operations",
      task: "Status probe auto-capture path (no_match)",
      phiRedacted: true,
      signalType: "no_match",
    }),
  });
  out.autoCaptureInsert = {
    http: insert.status,
    id: (insert.data as { id?: string }).id,
    digestEligible: (insert.data as { digestEligible?: boolean }).digestEligible,
    route: (insert.data as { route?: unknown }).route,
  };

  // Confirm row visible in list
  const gaps2 = await api(token, "/api/assist/gaps");
  const found = ((gaps2.data as { gaps?: { id: string }[] }).gaps || []).find((g) => g.id === probeId);
  out.autoCaptureVisibleInList = Boolean(found);

  // Chat soft-stop auto path (may soft-stop on obscure question)
  const chat = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `zzzxxy gap-email-auto-probe status-check ${Date.now()} what is the unicorn refund blackout calendar SOP`,
      history: [],
    }),
  });
  const chatData = (await chat.json().catch(() => ({}))) as {
    knowledgeGap?: boolean;
    gapAuto?: Record<string, unknown>;
    message?: string;
  };
  out.chatSoftStopProbe = {
    http: chat.status,
    knowledgeGap: chatData.knowledgeGap,
    gapAuto: chatData.gapAuto || null,
    messageClip: (chatData.message || "").slice(0, 180),
  };

  // Resolve probe so we don't pollute lead inbox permanently
  if (found) {
    const resolved = await api(token, `/api/assist/gaps/${encodeURIComponent(probeId)}/resolve`, {
      method: "POST",
      body: "{}",
    });
    out.probeResolved = { http: resolved.status };
  }

  // Cron secret dry_run weekday mode check
  const cron = loadCronSecret();
  out.cronSecretPresent = Boolean(cron);
  if (cron) {
    const modeCheck = await fetch(
      `${STAFF}/api/cron/weekday-team-messages?mode=dry_run&theme=thoughtful_thursday&sendDate=2026-08-27&skipMark=1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${cron}`, "x-cron-secret": cron },
      },
    );
    const modeData = await modeCheck.json().catch(() => ({}));
    out.weekdayCronDryRun = { http: modeCheck.status, data: modeData };

    const digestDry = await fetch(`${STAFF}/api/cron/lead-gap-digests?dryRun=1`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cron}`, "x-cron-secret": cron },
    });
    const digestDryData = await digestDry.json().catch(() => ({}));
    out.leadDigestCronDryRun = { http: digestDry.status, data: digestDryData };
  }

  // Env mode: try reading from vercel isn't possible; note from dry_run default when mode omitted
  if (cron) {
    const defaultMode = await fetch(
      `${STAFF}/api/cron/weekday-team-messages?theme=thoughtful_thursday&sendDate=2099-01-01&skipMark=1&mode=dry_run`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${cron}` },
      },
    );
    // separate call without mode override to see env default — use dry via forcing? 
    // Without mode param, uses env SIYA_WEEKDAY_EMAIL_MODE. Use skipMark + a fake future date
    // BUT that would SEND if live! Only safe if we pass mode=dry_run.
    // Instead inspect response from pilot-send with mode omitted via admin route.
    void defaultMode;
  }

  // Admin pilot-send with mode omitted reports env mode when dry? Check route.
  const pilot = await fetch(`${STAFF}/api/admin/weekday-messages/pilot-send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sendDate: "2099-01-02",
      theme: "thoughtful_thursday",
      mode: "dry_run",
      skipMark: true,
    }),
  });
  const pilotData = await pilot.json().catch(() => ({}));
  out.pilotSendDryRun = { http: pilot.status, data: pilotData };

  // Try to detect production env mode via a response that echoes resolveWeekdayEmailMode()
  // when mode not passed — DANGEROUS if live. Instead read vercel env via CLI file if any.
  out.notes = {
    vercelCronLs: "local-config shows weekday cron as 'not deployed' (checked separately)",
    leadGapDigestCronInVercelJson: false,
    weekdayCronInLocalConfig: true,
  };

  const dir = resolve(process.cwd(), "apps/hipaa-training/.cursor-verify");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, "status-probe-aug30.json");
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log("\nWrote", path);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
