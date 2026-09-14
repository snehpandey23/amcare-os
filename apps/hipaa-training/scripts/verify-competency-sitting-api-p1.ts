/**
 * Stage 1 verify — authenticated HTTP against sitting API (§8.2).
 *
 * Hits a live API (local or deployed) with QA credentials:
 *   source scripts/agent-qa-env.sh
 *   # optional: start local API with DATABASE_URL, then:
 *   SITTING_API_BASE=http://127.0.0.1:8787 npx tsx apps/hipaa-training/scripts/verify-competency-sitting-api-p1.ts
 *
 * Default base: HIPAA_TRAINING_API_URL / siya-staff-auth-api production.
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const AUTH = (
  process.env.SITTING_API_BASE ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app"
).replace(/\/$/, "");

const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/competency-sitting-api-p1.json",
);

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

async function login(): Promise<{ token: string; userId: string; email: string }> {
  const email = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");
  if (!/qa|test/i.test(email)) throw new Error(`Refusing non-QA email: ${email}`);
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; user?: { id?: string; email?: string }; error?: string };
  if (!res.ok || !data.token || !data.user?.id) throw new Error(data.error || `login HTTP ${res.status}`);
  return { token: data.token, userId: data.user.id, email: data.user.email || email };
}

async function api(token: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${AUTH}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, json };
}

async function main() {
  console.log(`API base: ${AUTH}`);
  const { token, email } = await login();
  pass("login", email);

  const current = await api(token, "GET", "/api/competency-exam/sittings/current");
  if (current.status !== 200) {
    fail("current", `HTTP ${current.status} ${JSON.stringify(current.json)}`);
    throw new Error("current sitting failed — is Stage 1 deployed / local API running?");
  }
  const sitting = (current.json as { sitting?: { id?: string; label?: string } }).sitting;
  if (!sitting?.id) {
    fail("current-shape", JSON.stringify(current.json));
    throw new Error("missing sitting.id");
  }
  pass("current", `${sitting.id} · ${sitting.label}`);

  const stamp = Date.now();
  const itemA = `p1-seen-item-a-${stamp}`;
  const itemB = `p1-seen-item-b-${stamp}`;
  const id1 = `p1-att-${stamp}-1`;
  const id2 = `p1-att-${stamp}-2`;

  const post1 = await api(token, "POST", `/api/competency-exam/sittings/${sitting.id}/sections/typing/attempts`, {
    id: id1,
    activeSec: 90,
    sectionScore: 70,
    itemIds: [itemA],
    repeatedIds: [],
    seenRecords: [{ pool: "typing", ids: [itemA], repeatedIds: [] }],
    trailJson: { source: "p1-api-verify", n: 1 },
  });
  if (post1.status !== 201) {
    fail("submit-1", `HTTP ${post1.status} ${JSON.stringify(post1.json)}`);
    throw new Error("first submit failed");
  }
  const a1 = post1.json as {
    attempt?: { attemptIndex?: number; sectionScore?: number };
    sectionAggregates?: { typing?: { averageScore?: number; attemptCount?: number } };
    compositePreview?: { pointsEarned?: number; incompleteSectionIds?: string[] };
  };
  assert.equal(a1.attempt?.attemptIndex, 1);
  assert.equal(a1.sectionAggregates?.typing?.averageScore, 70);
  assert.equal(a1.sectionAggregates?.typing?.attemptCount, 1);
  pass("submit-1", `index=1 avg=70 incomplete=${a1.compositePreview?.incompleteSectionIds?.length}`);

  const post2 = await api(token, "POST", `/api/competency-exam/sittings/${sitting.id}/sections/typing/attempts`, {
    id: id2,
    activeSec: 100,
    sectionScore: 90,
    itemIds: [itemB],
    repeatedIds: [],
    seenRecords: [{ pool: "typing", ids: [itemB], repeatedIds: [] }],
    trailJson: { source: "p1-api-verify", n: 2 },
  });
  if (post2.status !== 201) {
    fail("submit-2", `HTTP ${post2.status} ${JSON.stringify(post2.json)}`);
    throw new Error("second submit failed");
  }
  const a2 = post2.json as {
    attempt?: { attemptIndex?: number };
    sectionAggregates?: { typing?: { averageScore?: number; attemptCount?: number } };
    compositePreview?: { pointsEarned?: number; incompleteSectionIds?: string[] };
  };
  assert.equal(a2.attempt?.attemptIndex, 2);
  assert.equal(a2.sectionAggregates?.typing?.attemptCount, 2);
  assert.equal(a2.sectionAggregates?.typing?.averageScore, 80); // (70+90)/2
  assert.equal(a2.compositePreview?.pointsEarned, 9.6); // 12 * 0.8
  assert.ok(a2.compositePreview?.incompleteSectionIds?.includes("mcq"));
  pass("submit-2-average", `avg=80 attemptCount=2 pointsEarned=9.6`);

  const seenAll = await api(token, "GET", `/api/competency-exam/sittings/${sitting.id}/seen`);
  if (seenAll.status !== 200) {
    fail("seen-all", `HTTP ${seenAll.status}`);
  } else {
    const seen = (seenAll.json as { seen?: { id?: string; pool?: string; sittingId?: string }[] }).seen || [];
    const ids = new Set(seen.map((s) => s.id));
    const scopedOk = seen.every((s) => s.sittingId === sitting.id);
    if (ids.has(itemA) && ids.has(itemB) && scopedOk) {
      pass("seen-all", `contains ${itemA} + ${itemB}; sitting-scoped=${scopedOk}`);
    } else {
      fail("seen-all", `missing items or bad scope ids=${[...ids].join(",")}`);
    }
  }

  const seenPool = await api(token, "GET", `/api/competency-exam/sittings/${sitting.id}/seen?pool=typing`);
  if (seenPool.status !== 200) {
    fail("seen-pool", `HTTP ${seenPool.status}`);
  } else {
    const seen = (seenPool.json as { seen?: { id?: string; pool?: string }[] }).seen || [];
    const ok = seen.every((s) => s.pool === "typing") && seen.some((s) => s.id === itemA);
    if (ok) pass("seen-pool", `typing pool n=${seen.length}`);
    else fail("seen-pool", JSON.stringify(seen.slice(0, 5)));
  }

  const mine = await api(token, "GET", "/api/competency-exam/sittings/mine");
  if (mine.status !== 200) {
    fail("mine", `HTTP ${mine.status}`);
  } else {
    const sittings = (mine.json as { sittings?: { sittingId?: string }[] }).sittings || [];
    if (sittings.some((s) => s.sittingId === sitting.id)) pass("mine", `history includes ${sitting.id}`);
    else fail("mine", `sitting ${sitting.id} missing from mine`);
  }

  const current2 = await api(token, "GET", "/api/competency-exam/sittings/current");
  const agg = (current2.json as { sectionAggregates?: { typing?: { averageScore?: number; attemptCount?: number } } })
    .sectionAggregates?.typing;
  if (agg?.averageScore === 80 && agg?.attemptCount && agg.attemptCount >= 2) {
    pass("current-after-submits", `typing avg=${agg.averageScore} n=${agg.attemptCount}`);
  } else {
    fail("current-after-submits", JSON.stringify(agg));
  }

  mkdirSync(resolve(OUT, ".."), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ base: AUTH, sittingId: sitting.id, rows, post1: a1, post2: a2 }, null, 2));
  if (rows.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  mkdirSync(resolve(OUT, ".."), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ base: AUTH, rows, error: String(e) }, null, 2));
  process.exit(1);
});
