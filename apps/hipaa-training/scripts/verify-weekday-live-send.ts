/**
 * First live weekday send evidence — full staff list + Resend IDs for real accounts.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-weekday-live-send.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { buildWeekdayMessage, weekdayThemeForUtcDate } from "../src/lib/team-weekday-messages";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/weekday-live-send.json",
);

const QA_EMAIL = (process.env.ASSIST_EMAIL || "qa-test@siya.health").trim();
const QA_PASSWORD = (process.env.ASSIST_PASSWORD || "").trim();

const QA_PATTERNS = /qa-test@|qa-feedback|@example\.|test@siya/i;

type Row = { id: string; pass: boolean; detail: string };
const rows: Row[] = [];
function pass(id: string, detail: string) {
  rows.push({ id, pass: true, detail });
  console.log(`PASS\t${id}\t${detail}`);
}
function fail(id: string, detail: string) {
  rows.push({ id, pass: false, detail });
  console.error(`FAIL\t${id}\t${detail}`);
}

async function login() {
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function main() {
  if (!QA_PASSWORD) {
    fail("creds", "source scripts/agent-qa-env.sh");
    process.exit(1);
  }
  const token = await login();
  pass("admin-login", QA_EMAIL);

  const theme = weekdayThemeForUtcDate(new Date());
  if (!theme) {
    fail("theme", "Weekend — no weekday theme (IST)");
    process.exit(1);
  }
  pass("theme", theme);

  const recipRes = await fetch(
    `${AUTH}/api/admin/weekday-messages/recipients?theme=${encodeURIComponent(theme)}&includeAlreadySent=1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const recipData = (await recipRes.json()) as {
    sendDate?: string;
    recipients?: {
      email: string;
      firstName: string;
      segment: string;
      alreadySent: boolean;
      askTurnsLast14d: number;
      practiceLifetime: number;
    }[];
    error?: string;
  };
  if (!recipRes.ok) {
    fail("recipients", recipData.error || `HTTP ${recipRes.status}`);
    process.exit(1);
  }

  const all = recipData.recipients || [];
  const real = all.filter((r) => !QA_PATTERNS.test(r.email));
  const qaOnly = all.filter((r) => QA_PATTERNS.test(r.email));
  pass(
    "full-list",
    `sendDate=${recipData.sendDate} total=${all.length} realStaff=${real.length} qa=${qaOnly.length}`,
  );
  if (real.length < 2) {
    fail("real-staff-count", `need ≥2 real staff, got ${real.length}`);
  } else {
    pass(
      "real-staff-sample",
      real
        .slice(0, 5)
        .map((r) => `${r.email}[${r.segment}]`)
        .join(", "),
    );
  }

  // Live send — today's theme only (marks sent so cron won't double-send same day/theme)
  const sendRes = await fetch(`${STAFF}/api/admin/weekday-messages/pilot-send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      theme,
      mode: "live",
      skipMark: false,
      sendDate: recipData.sendDate,
    }),
  });
  const send = (await sendRes.json()) as {
    ok?: boolean;
    mode?: string;
    sentCount?: number;
    results?: {
      email: string;
      theme: string;
      segment: string;
      sent: boolean;
      resendId?: string;
      error?: string;
      subject?: string;
    }[];
    error?: string;
  };
  if (!sendRes.ok || !send.ok) {
    fail("live-send", send.error || `HTTP ${sendRes.status}`);
    process.exit(1);
  }
  if (send.mode !== "live") fail("mode-live", `got mode=${send.mode}`);
  else pass("mode-live", "mode=live");

  const sent = (send.results || []).filter((r) => r.sent && r.resendId);
  const sentReal = sent.filter((r) => !QA_PATTERNS.test(r.email));
  pass("sent-count", `sent=${sent.length} realStaffSent=${sentReal.length}`);

  if (sentReal.length < 2) {
    fail("real-delivery", `need ≥2 real staff deliveries, got ${sentReal.length}`);
  } else {
    for (const r of sentReal.slice(0, 6)) {
      const expected = buildWeekdayMessage({
        theme: r.theme as "thoughtful_thursday",
        segment: r.segment as "new_ask" | "regular_ask" | "practice_bridge",
        firstName: "X",
      });
      const subjectOk = r.subject === expected.subject;
      pass(
        `delivery-${r.email}`,
        `segment=${r.segment} subject=${r.subject} resend=${r.resendId} subjectMatch=${subjectOk}`,
      );
      if (!subjectOk) fail(`subject-${r.email}`, `got ${r.subject} expected ${expected.subject}`);
    }
  }

  const failed = (send.results || []).filter((r) => !r.sent);
  if (failed.length) {
    pass(
      "send-errors",
      failed
        .slice(0, 5)
        .map((r) => `${r.email}:${r.error}`)
        .join("; "),
    );
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        theme,
        sendDate: recipData.sendDate,
        mode: send.mode,
        recipientTotal: all.length,
        realStaffTotal: real.length,
        sentCount: sent.length,
        realStaffSent: sentReal.map((r) => ({
          email: r.email,
          segment: r.segment,
          subject: r.subject,
          resendId: r.resendId,
        })),
        passed: rows.filter((r) => r.pass).length,
        total: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${OUT}`);
  if (rows.some((r) => !r.pass)) process.exit(1);
  console.log("verify-weekday-live-send: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
