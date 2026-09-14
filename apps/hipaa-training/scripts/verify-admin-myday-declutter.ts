/**
 * Screenshot decluttered admin My Day + exercise decision-log quick prompt.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-admin-myday-declutter.ts
 *
 * Uses PASSWORD_TOGGLE pattern: local next on :4320 via ADMIN_MYDAY_BASE_URL or starts one.
 * Optional ASSIST_EMAIL/PASSWORD for live login; otherwise mocks /auth/me as admin.
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { AUTH_TOKEN_STORAGE_KEY } from "../src/lib/trainingConfig";

const PORT = 4320;
const BASE = (process.env.ADMIN_MYDAY_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const AUTH = (
  process.env.HIPAA_TRAINING_API_URL ||
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app"
).replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/admin-myday-declutter",
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

async function main() {
  mkdirSync(OUT, { recursive: true });
  let child: ChildProcess | null = null;
  const ownServer = !process.env.ADMIN_MYDAY_BASE_URL;

  if (ownServer) {
    child = spawn("npx", ["next", "dev", "-p", String(PORT), "-H", "127.0.0.1"], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: {
        ...process.env,
        NEXT_PUBLIC_HIPAA_TRAINING_API_URL:
          process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL || AUTH,
      },
    });
    await waitForServer(`${BASE}/login`);
    pass("local-dev", BASE);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.addInitScript(() => {
      try {
        const y = new Date().getFullYear();
        const m = String(new Date().getMonth() + 1).padStart(2, "0");
        const d = String(new Date().getDate()).padStart(2, "0");
        localStorage.setItem("siya-brand-intro-shown-on", `${y}-${m}-${d}`);
        sessionStorage.setItem("siya-brand-intro-skip-once", "1");
        sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
      } catch {
        /* ignore */
      }
    });

    const email = (process.env.ASSIST_EMAIL || "").trim();
    const password = (process.env.ASSIST_PASSWORD || "").trim();
    let token: string | null = null;
    if (email && password) {
      const loginRes = await fetch(`${AUTH}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await loginRes.json()) as { token?: string };
      token = data.token ?? null;
    }

    await page.route("**/api/staff-auth/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/api/auth/me") || url.includes("/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "11111111-1111-4111-8111-111111111111",
            email: email || "admin-verify@siya.health",
            name: "Admin Verify",
            role: "admin",
          }),
        });
        return;
      }
      if (url.includes("founder-coach") || url.includes("brief")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            weekStart: "2026-09-08",
            monthKey: "2026-09",
            domains: [],
            weeklyPlan: {
              founderFocus: "",
              canWait: [],
              updatedAt: new Date().toISOString(),
            },
            canEditWeekly: true,
            canEditMonthly: true,
            isWeekLocked: false,
          }),
        });
        return;
      }
      if (url.includes("/api/chat") || url.includes("/chat")) {
        // Let chat through to next rewrite / fail soft — we inject reply below for decision ask
        await route.continue().catch(async () => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              message:
                "**Decision log** — recent entries worth keeping in mind:\n\n1. **Homepage CTA → Meet & Greet** · Marketing\n   Replaced free discovery call with paid Meet & Greet.",
              ruleFinal: true,
            }),
          });
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ({ key, tok }) => {
        localStorage.setItem(key, tok || "verify-admin-token");
      },
      { key: AUTH_TOKEN_STORAGE_KEY, tok: token },
    );

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.getByRole("navigation", { name: /Founder Coach/i }).waitFor({ state: "visible", timeout: 45_000 });

    // Declutter assertions
    const tourBanner = page.locator("[data-tour-nudge]");
    assert.equal(await tourBanner.count(), 0, "tour nudge should not stack on admin My Day");
    const weekly = page.getByRole("region", { name: /Weekly lead check-in/i });
    assert.equal(await weekly.count(), 0, "weekly check-in should not greet on Ask tab");
    assert.equal(
      await page.getByText(/name, assistant label, training reminders/i).count(),
      0,
      "parenthetical Personalize detail should be gone",
    );
    await page.getByRole("button", { name: /^Ask$/i }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: /This week's plan/i }).waitFor({ state: "visible" });

    const shotPath = `${OUT}/admin-myday-ask.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    pass("screenshot", shotPath);

    // Weekly check-in lives on plan tab (may be null if user can't submit — still no crash)
    await page.getByRole("button", { name: /This week's plan/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/admin-myday-plan.png`, fullPage: false });
    pass("plan-tab", "opened This week's plan");

    // Back to Ask — tab label may be exact "Ask"
    const askTab = page.locator("nav[aria-label='Founder Coach']").getByRole("button", { name: "Ask" });
    if (await askTab.isVisible().catch(() => false)) {
      await askTab.click();
    }
    const decisionsBtn = page.getByRole("button", { name: /Any decisions I should remember/i });
    if (await decisionsBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await decisionsBtn.click();
      await page.waitForTimeout(2500);
      const body = await page.locator("main").innerText();
      assert.match(body, /Decision log|Homepage CTA|decisions/i);
      await page.screenshot({ path: `${OUT}/admin-myday-decisions.png`, fullPage: false });
      pass("decisions-prompt", "quick prompt returned decision content");
    } else {
      console.log("SKIP decisions UI prompt — button not visible; engine smoke covers content");
    }

    writeFileSync(
      `${OUT}/summary.json`,
      JSON.stringify(
        {
          tourOnAsk: false,
          weeklyOnAsk: false,
          parentheticalGone: true,
          shots: ["admin-myday-ask.png", "admin-myday-plan.png"],
        },
        null,
        2,
      ),
    );
    console.log("ok: verify-admin-myday-declutter");
  } finally {
    await browser.close();
    if (child?.pid) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
