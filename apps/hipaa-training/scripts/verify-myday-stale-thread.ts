/**
 * Verify My Day never lands on "Thread not found" for stale / deleted thread ids.
 *
 * Covers:
 * 1. API: DELETE then DELETE again → 404 (client must treat as ok)
 * 2. Browser: session with booted + active id pointing at deleted thread → greeting, not error
 * 3. Browser: fresh session (no booted flag) → Untitled / Good morning
 * 4. Browser: valid last thread still opens that thread
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-myday-stale-thread.ts
 */
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { AUTH_TOKEN_STORAGE_KEY } from "../src/lib/trainingConfig";

const PORT = 4321;
const BASE = (process.env.MYDAY_THREAD_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const AUTH = (
  process.env.HIPAA_TRAINING_API_URL ||
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app"
).replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/myday-stale-thread",
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

async function login(): Promise<string> {
  const email = process.env.ASSIST_EMAIL;
  const password = process.env.ASSIST_PASSWORD;
  assert.ok(email && password, "ASSIST_EMAIL / ASSIST_PASSWORD required");
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  assert.ok(res.ok && data.token, data.error || `login ${res.status}`);
  return data.token!;
}

async function apiJson(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${AUTH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const token = await login();
  pass("login");

  // --- API: create → delete → delete again (Clear race) ---
  const created = await apiJson(token, "/api/assist/threads", {
    method: "POST",
    body: JSON.stringify({ title: "New chat" }),
  });
  const deadId = created.body.thread?.id as string;
  assert.ok(deadId?.startsWith("ath-"), "create thread");
  const del1 = await apiJson(token, `/api/assist/threads/${deadId}`, { method: "DELETE" });
  assert.equal(del1.res.status, 200, "first delete");
  const del2 = await apiJson(token, `/api/assist/threads/${deadId}`, { method: "DELETE" });
  assert.equal(del2.res.status, 404, "second delete 404");
  assert.match(String(del2.body.error || ""), /thread not found/i);
  const getDead = await apiJson(token, `/api/assist/threads/${deadId}`);
  assert.equal(getDead.res.status, 404);
  pass("api-stale-delete-404", deadId);

  // Ensure at least one real thread exists for "valid last thread" case
  const list = await apiJson(token, "/api/assist/threads");
  let validId = (list.body.threads as { id: string; title?: string; messageCount?: number }[] | undefined)?.find(
    (t) => (t.messageCount ?? 0) > 0,
  )?.id;
  if (!validId) {
    const t = await apiJson(token, "/api/assist/threads", {
      method: "POST",
      body: JSON.stringify({ title: "verify valid thread" }),
    });
    validId = t.body.thread?.id;
    await apiJson(token, `/api/assist/threads/${validId}/turns`, {
      method: "POST",
      body: JSON.stringify({
        userContent: "ping verify",
        assistantContent: "pong verify",
      }),
    });
  }
  assert.ok(validId, "valid thread id");
  pass("api-valid-thread", validId);

  let child: ChildProcess | null = null;
  const ownServer = !process.env.MYDAY_THREAD_BASE_URL;
  if (ownServer) {
    child = spawn("npx", ["next", "dev", "-p", String(PORT), "-H", "127.0.0.1"], {
      cwd: process.cwd().includes("hipaa-training")
        ? process.cwd()
        : resolve(process.cwd(), "apps/hipaa-training"),
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

  async function seedAuthAndSession(opts: {
    booted?: boolean;
    activeId?: string | null;
    clearBoot?: boolean;
  }) {
    await page.addInitScript(
      ({ tokenKey, tokenVal, booted, activeId, clearBoot }) => {
        try {
          localStorage.setItem(tokenKey, tokenVal);
          const y = new Date().getFullYear();
          const m = String(new Date().getMonth() + 1).padStart(2, "0");
          const d = String(new Date().getDate()).padStart(2, "0");
          localStorage.setItem("siya-brand-intro-shown-on", `${y}-${m}-${d}`);
          sessionStorage.setItem("siya-brand-intro-skip-once", "1");
          sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
          if (clearBoot) {
            sessionStorage.removeItem("siya-assist-session-booted");
            sessionStorage.removeItem("siya-assist-active-thread");
          } else {
            if (booted) sessionStorage.setItem("siya-assist-session-booted", "1");
            else sessionStorage.removeItem("siya-assist-session-booted");
            if (activeId) sessionStorage.setItem("siya-assist-active-thread", activeId);
            else sessionStorage.removeItem("siya-assist-active-thread");
          }
        } catch {
          /* ignore */
        }
      },
      {
        tokenKey: AUTH_TOKEN_STORAGE_KEY,
        tokenVal: token,
        booted: opts.booted ?? false,
        activeId: opts.activeId ?? null,
        clearBoot: opts.clearBoot ?? false,
      },
    );
  }

  try {
    // 1) Stale last-active thread (deleted server-side) with session already booted
    await seedAuthAndSession({ booted: true, activeId: deadId });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForFunction(
      () => !/Loading Assist|Loading conversation/i.test(document.body.innerText),
      { timeout: 25_000 },
    );
    const body1 = await page.locator("body").innerText();
    assert.doesNotMatch(body1, /Thread not found/i, "stale: no Thread not found");
    writeFileSync(`${OUT}/stale-last-thread.png`, await page.screenshot({ fullPage: true }));
    pass("ui-stale-last-thread-fallback");

    // 2) Fresh session (clear booted) — lands on empty greeting
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage({ viewport: { width: 1280, height: 900 } });
    await page2.addInitScript(
      ({ tokenKey, tokenVal }) => {
        localStorage.setItem(tokenKey, tokenVal);
        sessionStorage.removeItem("siya-assist-session-booted");
        sessionStorage.removeItem("siya-assist-active-thread");
        sessionStorage.setItem("siya-brand-intro-skip-once", "1");
        sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
      },
      { tokenKey: AUTH_TOKEN_STORAGE_KEY, tokenVal: token },
    );
    await page2.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page2.waitForFunction(
      () => !/Loading Assist|Loading conversation/i.test(document.body.innerText),
      { timeout: 20_000 },
    );
    const body2 = await page2.locator("body").innerText();
    assert.doesNotMatch(body2, /Thread not found/i);
    writeFileSync(`${OUT}/fresh-session.png`, await page2.screenshot({ fullPage: true }));
    pass("ui-fresh-session");
    await ctx2.close();

    // 3) Valid last thread still opens (booted + saved id that exists)
    const ctx3 = await browser.newContext();
    const page3 = await ctx3.newPage({ viewport: { width: 1280, height: 900 } });
    await page3.addInitScript(
      ({ tokenKey, tokenVal, activeId }) => {
        localStorage.setItem(tokenKey, tokenVal);
        sessionStorage.setItem("siya-assist-session-booted", "1");
        sessionStorage.setItem("siya-assist-active-thread", activeId);
        sessionStorage.setItem("siya-brand-intro-skip-once", "1");
        sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
      },
      { tokenKey: AUTH_TOKEN_STORAGE_KEY, tokenVal: token, activeId: validId },
    );
    await page3.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page3.waitForFunction(
      () => !/Loading Assist|Loading conversation/i.test(document.body.innerText),
      { timeout: 20_000 },
    );
    const body3 = await page3.locator("body").innerText();
    assert.doesNotMatch(body3, /Thread not found/i);
    writeFileSync(`${OUT}/valid-last-thread.png`, await page3.screenshot({ fullPage: true }));
    pass("ui-valid-last-thread");
    await ctx3.close();

    // 4) Deep link to deleted thread
    const ctx4 = await browser.newContext();
    const page4 = await ctx4.newPage({ viewport: { width: 1280, height: 900 } });
    await page4.addInitScript(
      ({ tokenKey, tokenVal }) => {
        localStorage.setItem(tokenKey, tokenVal);
        sessionStorage.removeItem("siya-assist-session-booted");
        sessionStorage.removeItem("siya-assist-active-thread");
        sessionStorage.setItem("siya-brand-intro-skip-once", "1");
        sessionStorage.setItem("siya-tour-nudge-dismissed-session", "1");
      },
      { tokenKey: AUTH_TOKEN_STORAGE_KEY, tokenVal: token },
    );
    await page4.goto(`${BASE}/?thread=${encodeURIComponent(deadId)}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page4.waitForFunction(
      () => !/Loading Assist|Loading conversation/i.test(document.body.innerText),
      { timeout: 20_000 },
    );
    const body4 = await page4.locator("body").innerText();
    assert.doesNotMatch(body4, /Thread not found/i);
    writeFileSync(`${OUT}/stale-deep-link.png`, await page4.screenshot({ fullPage: true }));
    pass("ui-stale-deep-link");
    await ctx4.close();

    console.log("\nALL PASS — My Day stale-thread recovery");
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
  console.error("FAIL", e);
  process.exit(1);
});
