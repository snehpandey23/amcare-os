/**
 * Live HTTP verify: admin inserts ≥3 gaps across 2+ user ids → Ops B2 pattern.
 * Confirms no SOP/pending_review auto-create. Retires seed packs via Ops load.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx integrations/hipaa-training-api/scripts/verify-recurring-gap-live.ts
 */
const API =
  process.env.HIPAA_TRAINING_API_URL ||
  process.env.TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";

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
  if (!res.ok || !data.token || !data.user) throw new Error(data.error || `login failed ${res.status}`);
  return data as { token: string; user: { id: string; email: string; role?: string } };
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

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const email = (process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");

  const admin = await login(email, password);
  assert(admin.user.role === "admin", "verify needs admin for reporter override + full Ops B2");
  console.log("admin", admin.user.email);

  // Ops load also runs retireDuplicateSeedPacks
  const dash0 = await api(admin.token, "/api/ops/dashboard");
  assert(dash0.status === 200, `ops ${dash0.status} ${JSON.stringify(dash0.data)}`);
  const eng = (dash0.data as { engagement?: { userId: string; email: string }[] }).engagement || [];
  const users = eng.map((e) => e.userId).filter(Boolean);
  assert(users.length >= 2, `need ≥2 engagement users, got ${users.length}`);
  const userA = users[0]!;
  const userB = users.find((id) => id !== userA) || users[1]!;
  assert(userA !== userB, "distinct reporters");

  const flags = (dash0.data as { founderSopConsolidationFlags?: { candidates: unknown[] }[] })
    .founderSopConsolidationFlags;
  console.log(
    "founder Zocdoc consolidation candidates:",
    flags?.[0]?.candidates?.length ?? 0,
    "(human pick — no auto-merge)",
  );

  const probeTask = `LIVE recurring gap probe ${Date.now()}`;
  const gapIds: string[] = [];
  const reporters = [userA, userA, userB];
  for (let i = 0; i < 3; i++) {
    const id = `gap-live-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    gapIds.push(id);
    const { status, data } = await api(admin.token, "/api/assist/gaps", {
      method: "POST",
      body: JSON.stringify({
        id,
        department: "Marketing",
        task: probeTask,
        phiRedacted: true,
        signalType: "notify_owner",
        reportedByUserId: reporters[i],
      }),
    });
    assert(status === 201, `insert ${status} ${JSON.stringify(data)}`);
    assert(
      (data as { gap?: { reportedByUserId?: string } }).gap?.reportedByUserId === reporters[i],
      "reportedByUserId stamped",
    );
  }

  // Same person ×3 must NOT create a multi-staff pattern (control)
  const spamTask = `LIVE single-person spam ${Date.now()}`;
  const spamIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const id = `gap-spam-${Date.now()}-${i}`;
    spamIds.push(id);
    await api(admin.token, "/api/assist/gaps", {
      method: "POST",
      body: JSON.stringify({
        id,
        department: "Marketing",
        task: spamTask,
        phiRedacted: true,
        signalType: "notify_owner",
        reportedByUserId: userA,
      }),
    });
  }

  const pendingBefore = await api(admin.token, "/api/knowledge/sops?status=pending_review");
  const pendingCount = (s: { data: unknown }) => {
    const d = s.data as { sops?: unknown[] };
    return Array.isArray(d.sops) ? d.sops.length : -1;
  };
  const beforePending = pendingCount(pendingBefore);

  const dash = await api(admin.token, "/api/ops/dashboard");
  assert(dash.status === 200, "ops after insert");
  const patterns =
    (dash.data as {
      recurringGapPatterns?: {
        taskLabel: string;
        openGapCount: number;
        distinctPeople: number;
        surfaceOnlyNote: string;
        multiStaff: boolean;
      }[];
    }).recurringGapPatterns || [];

  const hit = patterns.find((p) => p.taskLabel === probeTask);
  assert(Boolean(hit), `B2 missing probe pattern; patterns=${patterns.length}`);
  assert(hit!.openGapCount >= 3, `count ${hit!.openGapCount}`);
  assert(hit!.distinctPeople >= 2, `people ${hit!.distinctPeople}`);
  assert(hit!.multiStaff === true, "multiStaff");
  assert(/no auto-draft/i.test(hit!.surfaceOnlyNote), "surface-only copy");
  assert(!patterns.some((p) => p.taskLabel === spamTask), "single-person spam must not surface as multi-staff");

  const pendingAfter = pendingCount(await api(admin.token, "/api/knowledge/sops?status=pending_review"));
  if (beforePending >= 0 && pendingAfter >= 0) {
    assert(pendingAfter === beforePending, "HARD BOUNDARY: no new pending_review SOPs");
  }

  for (const id of [...gapIds, ...spamIds]) {
    await api(admin.token, `/api/assist/gaps/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      body: "{}",
    });
  }

  const dash2 = await api(admin.token, "/api/ops/dashboard");
  const patterns2 =
    (dash2.data as { recurringGapPatterns?: { taskLabel: string }[] }).recurringGapPatterns || [];
  assert(!patterns2.some((p) => p.taskLabel === probeTask), "pattern clears when gaps resolved");

  console.log("verify-recurring-gap-live: OK", {
    probeTask,
    people: hit!.distinctPeople,
    count: hit!.openGapCount,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
