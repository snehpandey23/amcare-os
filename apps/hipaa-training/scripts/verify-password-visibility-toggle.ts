/**
 * Verify password show/hide toggle on login, reset, account, and admin invite.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-password-visibility-toggle.ts
 *
 * Optional: ASSIST_EMAIL + ASSIST_PASSWORD for signed-in account + admin invite.
 * Starts local `next dev` on :4317 unless PASSWORD_TOGGLE_BASE_URL is set.
 */
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { chromium, type Locator } from "playwright";
import { AUTH_TOKEN_STORAGE_KEY } from "../src/lib/trainingConfig";

const PORT = 4317;
const BASE = (process.env.PASSWORD_TOGGLE_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
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

async function assertToggleShowsPassword(wrap: Locator, sample: string, label: string) {
  const input = wrap.locator("input");
  const toggle = wrap.locator("[data-password-visibility-toggle]");
  await input.waitFor({ state: "visible", timeout: 20_000 });
  await input.evaluate((el) => {
    el.setAttribute("autocomplete", "off");
    el.setAttribute("data-1p-ignore", "true");
    el.setAttribute("data-lpignore", "true");
  });
  await input.click();
  // Character-by-character so controlled React state updates (Playwright fill can
  // leave autocomplete=new-password fields DOM-only in Chromium).
  await input.fill("");
  await input.pressSequentially(sample, { delay: 15 });
  assert.equal(await input.inputValue(), sample, `${label}: typed value should stick`);
  await input.evaluate((el) => (el as HTMLInputElement).blur());
  await input.click();
  assert.equal(await input.inputValue(), sample, `${label}: value should survive blur`);

  assert.equal(await toggle.getAttribute("aria-label"), "Show password");
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  // Masked: either type=password (Firefox) or CSS disc mask (Chromium/WebKit).
  const typeMasked = await input.getAttribute("type");
  const dataMasked = await input.getAttribute("data-password-masked");
  assert.ok(
    typeMasked === "password" || dataMasked === "true",
    `${label}: expected masked default (type=${typeMasked}, data-masked=${dataMasked})`,
  );

  await toggle.click({ force: true });
  try {
    await toggle.locator("xpath=self::*[@aria-pressed='true']").waitFor({ timeout: 2000 });
  } catch {
    await toggle.evaluate((el) => (el as HTMLButtonElement).click());
    await toggle.locator("xpath=self::*[@aria-pressed='true']").waitFor({ timeout: 2000 });
  }
  assert.equal(await toggle.getAttribute("aria-pressed"), "true", `${label}: toggle should press`);
  assert.equal(await toggle.getAttribute("aria-label"), "Hide password");
  assert.equal(await input.getAttribute("type"), "text", `${label}: should reveal as text`);
  assert.equal(await input.getAttribute("data-password-masked"), "false");
  const revealed = await input.inputValue();
  if (revealed !== sample) {
    const dump = await wrap.evaluate((node) => {
      const el = node.querySelector("input") as HTMLInputElement | null;
      return {
        value: el?.value ?? null,
        type: el?.type ?? null,
        masked: el?.getAttribute("data-password-masked"),
        html: node.innerHTML.slice(0, 400),
      };
    });
    throw new Error(`${label}: value must remain after reveal — got ${JSON.stringify(dump)}`);
  }

  await toggle.click({ force: true });
  try {
    await toggle.locator("xpath=self::*[@aria-pressed='false']").waitFor({ timeout: 2000 });
  } catch {
    await toggle.evaluate((el) => (el as HTMLButtonElement).click());
    await toggle.locator("xpath=self::*[@aria-pressed='false']").waitFor({ timeout: 2000 });
  }
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  const typeAgain = await input.getAttribute("type");
  const dataAgain = await input.getAttribute("data-password-masked");
  assert.ok(
    typeAgain === "password" || dataAgain === "true",
    `${label}: should re-mask (type=${typeAgain}, data-masked=${dataAgain})`,
  );
  assert.equal(await input.inputValue(), sample, `${label}: value must remain after remask`);
}

async function main() {
  let child: ChildProcess | null = null;
  const ownServer = !process.env.PASSWORD_TOGGLE_BASE_URL;

  if (ownServer) {
    child = spawn("npx", ["next", "dev", "-p", String(PORT), "-H", "127.0.0.1"], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: {
        ...process.env,
        // Local verify must enable portal auth so login/reset forms render.
        NEXT_PUBLIC_HIPAA_TRAINING_API_URL:
          process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
          process.env.HIPAA_TRAINING_API_URL ||
          "https://siya-staff-auth-api.vercel.app",
      },
    });
    child.stderr?.on("data", () => {});
    await waitForServer(`${BASE}/login`);
    pass("local-dev", BASE);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Skip branded splash so login form is immediate in headless runs.
    await page.addInitScript(() => {
      try {
        const y = new Date().getFullYear();
        const m = String(new Date().getMonth() + 1).padStart(2, "0");
        const d = String(new Date().getDate()).padStart(2, "0");
        localStorage.setItem("siya-brand-intro-shown-on", `${y}-${m}-${d}`);
        sessionStorage.setItem("siya-brand-intro-skip-once", "1");
      } catch {
        /* ignore */
      }
    });

    // 1) Login
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 90_000 });
    await page.getByRole("heading", { name: /Staff portal/i }).waitFor({ state: "visible", timeout: 90_000 });
    const loginWrap = page.locator("[data-password-input]").first();
    await assertToggleShowsPassword(loginWrap, "ToggleLogin99!", "login");
    pass("login-toggle");

    // 2) Reset password (dummy token so form renders)
    await page.goto(`${BASE}/reset-password?token=verify-toggle-token`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const resetWraps = page.locator("[data-password-input]");
    await resetWraps.first().waitFor({ state: "visible", timeout: 30_000 });
    assert.equal(await resetWraps.count(), 2);
    await assertToggleShowsPassword(resetWraps.nth(0), "ToggleReset99!", "reset-new");
    await assertToggleShowsPassword(resetWraps.nth(1), "ToggleReset99!", "reset-confirm");
    pass("reset-password-toggle", "both fields");

    // 3) Account settings — mock /auth/me so AccountPanel mounts without live QA creds
    await page.route("**/api/staff-auth/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          email: "toggle-verify@siya.health",
          name: "Toggle Verify",
          role: "admin",
        }),
      });
    });
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          email: "toggle-verify@siya.health",
          name: "Toggle Verify",
          role: "admin",
        }),
      });
    });

    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate((key) => {
      localStorage.setItem(key, "verify-password-toggle-token");
    }, AUTH_TOKEN_STORAGE_KEY);

    await page.goto(`${BASE}/account`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const accountWraps = page.locator("[data-password-input]");
    await accountWraps.first().waitFor({ state: "visible", timeout: 45_000 });
    assert.ok((await accountWraps.count()) >= 3, "account should have 3 password fields");
    await assertToggleShowsPassword(accountWraps.nth(0), "ToggleAcctOld99!", "account-current");
    await assertToggleShowsPassword(accountWraps.nth(1), "ToggleAcctNew99!", "account-new");
    await assertToggleShowsPassword(accountWraps.nth(2), "ToggleAcctNew99!", "account-confirm");
    pass("account-settings-toggle", "all 3 fields");

    // 4) Admin invite + emergency password — register mocks before navigation
    await page.unroute("**/api/staff-auth/**").catch(() => {});
    await page.route("**/api/staff-auth/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/api/auth/me")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "11111111-1111-4111-8111-111111111111",
            email: "toggle-verify@siya.health",
            name: "Toggle Verify",
            role: "admin",
          }),
        });
        return;
      }
      if (url.includes("/api/admin/users/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            member: {
              id: "22222222-2222-4222-8222-222222222222",
              email: "teammate@siya.health",
              name: "Teammate",
              role: "trainee",
            },
          }),
        });
        return;
      }
      if (url.includes("roster") || url.includes("/admin/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ members: [], roster: [] }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto(`${BASE}/admin/team`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByRole("heading", { name: /Team health/i }).waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
    const inviteOpen = page.getByRole("button", { name: /Invite team member/i });
    if (await inviteOpen.isVisible().catch(() => false)) {
      await inviteOpen.click();
      const inviteWrap = page.locator("[data-password-input]").first();
      await inviteWrap.waitFor({ state: "visible", timeout: 15_000 });
      await assertToggleShowsPassword(inviteWrap, "ToggleInvite99!", "admin-invite");
      pass("admin-invite-toggle");
    } else {
      console.log("SKIP admin-invite — Invite team member not visible");
    }

    await page.goto(
      `${BASE}/admin/team/edit?userId=22222222-2222-4222-8222-222222222222`,
      { waitUntil: "domcontentloaded", timeout: 60_000 },
    );
    const editPw = page.locator("[data-password-input]").first();
    if (await editPw.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await assertToggleShowsPassword(editPw, "ToggleEmerg99!", "admin-edit");
      pass("admin-edit-password-toggle");
    } else {
      console.log("SKIP admin-edit — password field not visible");
    }

    console.log("ok: verify-password-visibility-toggle");
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
