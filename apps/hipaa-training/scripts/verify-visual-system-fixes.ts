/**
 * Visual-system fixes — founder before/after screenshots.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-visual-system-fixes.ts
 *
 * Captures:
 *   (a) dense table before/after zebra
 *   (b) default My Day theme (dark forced vs light default)
 *   (c) admin learning-health KPI tile row
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { chromium, type Page, type Route } from "playwright";
import { AUTH_TOKEN_STORAGE_KEY } from "../src/lib/trainingConfig";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const PORT = 4322;
const BASE = (process.env.VISUAL_FIXES_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const AUTH = (
  process.env.HIPAA_TRAINING_API_URL ||
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app"
).replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/visual-system-fixes",
);

function pass(label: string, detail?: string) {
  console.log(`PASS ${label}${detail ? ` — ${detail}` : ""}`);
}

async function waitForServer(url: string, ms = 120_000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.status > 0) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not ready: ${url}`);
}

const MOCK_MEMBERS = Array.from({ length: 8 }, (_, i) => ({
  id: `11111111-1111-4111-8111-11111111111${i}`,
  email: `staff${i}@siya.health`,
  name: `Staff Member ${i + 1}`,
  portalRole: i === 0 ? "admin" : "trainee",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLoginAt: "2026-09-10T10:00:00.000Z",
  deactivatedAt: null,
  progressUpdatedAt: null,
  training: {
    workforceRole: "clinical",
    learnerName: null,
    modulesCompleted: i % 5 === 0 ? 7 : i % 5,
    finalExamReady: i % 3 === 0,
    secondsInCourse: 1200 + i * 60,
    updatedAt: null,
  },
  levelUp: {
    totalXp: 100 * i,
    streak: i,
    lastActiveDate: "2026-09-10",
    chatPracticeSessions: i,
    usCultureSessions: 0,
    billingPracticeSessions: 0,
    dailyLearningSessions: 0,
  },
}));

function isStaffApi(url: string): boolean {
  return url.includes("/api/staff-auth/") || url.includes("siya-staff-auth-api.vercel.app");
}

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function installApiMocks(page: Page) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (!isStaffApi(url)) {
      await route.continue();
      return;
    }

    if (url.includes("/api/auth/me")) {
      await fulfillJson(route, {
        id: MOCK_MEMBERS[0].id,
        email: "admin-verify@siya.health",
        name: "Admin Verify",
        role: "admin",
        portalRole: "admin",
      });
      return;
    }

    if (url.includes("/api/admin/team/roster")) {
      await fulfillJson(route, { members: MOCK_MEMBERS });
      return;
    }

    if (url.includes("/api/admin/competency-exam/sittings")) {
      await fulfillJson(route, {
        sittings: MOCK_MEMBERS.slice(0, 5).map((m) => ({
          sittingId: "sit-2026-09",
          label: "September 2026",
          opensAt: "2026-09-01T00:00:00.000Z",
          closesAt: "2026-09-30T23:59:59.000Z",
          status: "open",
          firstActivityAt: "2026-09-05T00:00:00.000Z",
          closedAt: null,
          sectionAggregates: {},
          composite: { pointsEarned: 70, incompleteSectionIds: [] },
          compositeSummary: null,
          userId: m.id,
          userEmail: m.email,
          userName: m.name,
        })),
        trends: [],
      });
      return;
    }

    if (url.includes("/api/ops/dashboard")) {
      await fulfillJson(route, {
        engagement: MOCK_MEMBERS.map((m, i) => ({
          userId: m.id,
          email: m.email,
          name: m.name,
          askTurnsLast14d: i,
          askTurnsLast30d: i * 2,
          usageSegment: i < 3 ? "new_ask" : "regular_ask",
          practiceFrequency: i,
          streak: i,
          totalXp: 100 * i,
          chatSimRedFlags: 0,
          lastActiveDate: "2026-09-10",
          dayLedger: [],
          practiceShareThisWeek: {
            optedInShared: false,
            drillDaysShared: 0,
            drillDaysActive: 0,
            weekStart: "2026-09-08",
            weekEnd: "2026-09-14",
          },
          departments: ["Clinical"],
          isTestAccount: false,
        })),
        leadResponsiveness: [],
        recurringGapPatterns: [],
        founderSopConsolidationFlags: [],
        knowledgeGaps: [],
        scheduledVsActual: [],
        rosterDate: "2026-09-13",
        generatedAt: new Date().toISOString(),
      });
      return;
    }

    if (url.includes("/api/admin/shift/dashboard")) {
      await fulfillJson(route, {
        date: "2026-09-13",
        timezone: "Asia/Kolkata",
        live: {
          expected: 8,
          working: 3,
          inFocus: 1,
          onBreak: 1,
          offShift: 3,
          members: MOCK_MEMBERS.slice(0, 4).map((m, i) => ({
            id: m.id,
            email: m.email,
            name: m.name,
            onShift: i < 2,
            presence: i === 0 ? "working" : i === 1 ? "focus" : "break",
          })),
        },
        today: {
          uniqueStarters: 4,
          loginStarts: 3,
          manualStarts: 1,
          shiftEnds: 1,
          breakStarts: 2,
          focusStarts: 1,
          toolOpens: 5,
        },
        toolLinks: [],
      });
      return;
    }

    if (url.includes("/api/admin/shift/trends") || url.includes("/api/shift/trends")) {
      await fulfillJson(route, {
        periodDays: 14,
        startedShifts: 20,
        completedShifts: 18,
        avgFocusSessionsPerShift: 1.2,
        note: "Mock trends",
      });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  let child: ChildProcess | null = null;
  const ownServer = !process.env.VISUAL_FIXES_BASE_URL;
  const appCwd = process.cwd().includes("hipaa-training")
    ? process.cwd()
    : resolve(process.cwd(), "apps/hipaa-training");

  if (ownServer) {
    child = spawn("npx", ["next", "dev", "-p", String(PORT), "-H", "127.0.0.1"], {
      cwd: appCwd,
      stdio: "pipe",
      env: {
        ...process.env,
        NEXT_PUBLIC_HIPAA_TRAINING_API_URL: AUTH,
        HIPAA_TRAINING_API_URL: AUTH,
        NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN: "1",
      },
    });
    await waitForServer(`${BASE}/login`);
    pass("local-dev", BASE);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.addInitScript(
      ({ themeKey, authKey }) => {
        try {
          const y = new Date().getFullYear();
          const m = String(new Date().getMonth() + 1).padStart(2, "0");
          const d = String(new Date().getDate()).padStart(2, "0");
          localStorage.setItem("siya-brand-intro-shown-on", `${y}-${m}-${d}`);
          sessionStorage.setItem("siya-brand-intro-skip-once", "1");
          sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
          localStorage.removeItem(themeKey);
          localStorage.setItem(authKey, "verify-visual-token");
        } catch {
          /* ignore */
        }
      },
      { themeKey: THEME_STORAGE_KEY, authKey: AUTH_TOKEN_STORAGE_KEY },
    );

    await installApiMocks(page);

    // —— (b) My Day: before = prior dark default look ——
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(1200);
    await page.evaluate((themeKey) => {
      localStorage.setItem(themeKey, "dark");
      document.documentElement.classList.add("dark");
    }, THEME_STORAGE_KEY);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), true);
    await page.screenshot({ path: `${OUT}/before-myday-default.png`, fullPage: false });
    pass("before-myday", "forced dark (prior default)");

    // after = clear preference → light default
    await page.evaluate((themeKey) => {
      localStorage.removeItem(themeKey);
      document.documentElement.classList.remove("dark");
    }, THEME_STORAGE_KEY);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), false);
    await page.screenshot({ path: `${OUT}/after-myday-default.png`, fullPage: false });
    pass("after-myday", "light default");

    // —— (a)+(c) Team: KPI tiles + roster zebra ——
    await page.goto(`${BASE}/admin/team`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.getByRole("heading", { name: /Team health/i }).waitFor({ state: "visible", timeout: 45_000 });
    await page.waitForSelector("[data-learning-health]", { timeout: 45_000 });
    await page.waitForSelector("table.siya-dense-table tbody tr[data-row-parity]", { timeout: 30_000 });

    // before zebra: neutralize row-alt fill for comparison shot
    await page.addStyleTag({
      content: `
        .siya-dense-table > tbody > tr[data-row-parity="even"] { background-color: transparent !important; }
        .siya-dense-table > thead > tr { border-bottom-width: 1px !important; }
      `,
    });
    await page.locator("table.siya-dense-table").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/before-team-table.png`, fullPage: false });
    pass("before-table", "zebra neutralized");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-learning-health]", { timeout: 45_000 });
    await page.waitForSelector('table.siya-dense-table tbody tr[data-row-parity="even"]', {
      timeout: 30_000,
    });
    await page.locator("[data-learning-health]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/after-admin-kpi-tiles.png`, fullPage: false });
    pass("after-kpi", "learning health tiles");

    await page.locator("table.siya-dense-table").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/after-team-table.png`, fullPage: false });
    pass("after-table", "zebra striping");

    const evenBg = await page.evaluate(() => {
      const row = document.querySelector('table.siya-dense-table tbody tr[data-row-parity="even"]');
      if (!row) return null;
      return getComputedStyle(row).backgroundColor;
    });
    assert.ok(evenBg && evenBg !== "rgba(0, 0, 0, 0)" && evenBg !== "transparent", `zebra bg=${evenBg}`);
    pass("zebra-computed", String(evenBg));

    const kpiText = await page.locator("[data-learning-health]").innerText();
    assert.match(kpiText, /Learning health at a glance/i);
    assert.match(kpiText, /Team members/i);
    assert.match(kpiText, /HIPAA modules/i);
    assert.match(kpiText, /Competency sitting/i);

    writeFileSync(
      `${OUT}/summary.json`,
      JSON.stringify(
        {
          themeDefault: "light",
          shots: [
            "before-myday-default.png",
            "after-myday-default.png",
            "before-team-table.png",
            "after-team-table.png",
            "after-admin-kpi-tiles.png",
          ],
          zebraEvenBg: evenBg,
        },
        null,
        2,
      ),
    );
    console.log("ok: verify-visual-system-fixes");
  } finally {
    await browser.close();
    if (child?.pid) {
      try {
        child.kill("SIGTERM");
      } catch {
        /* ignore */
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
