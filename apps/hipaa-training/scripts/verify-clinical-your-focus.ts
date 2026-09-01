/**
 * Verify Clinical lead Your Focus against live prod data.
 *
 * Prefers authenticating as Vayushi when VAYUSHI_PASSWORD is set.
 * Otherwise: admin QA confirms she is Clinical Ops lead, then builds the
 * same inbox from live Clinical gaps + pending_review SOPs.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-clinical-your-focus.ts
 *
 * Optional:
 *   VAYUSHI_PASSWORD=…  → login as vayushi@siya.health
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildLeadFocusItems,
  capLeadFocusItems,
  YOUR_FOCUS_CAP,
} from "../src/lib/lead-your-focus";

const API = process.env.TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
const VAYUSHI_EMAIL = "vayushi@siya.health";
const VAYUSHI_ID = "41f7e6d1-616e-4a9c-93bc-9e7524efb2ee";

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
    user?: { id: string; email: string; name?: string; role?: string };
    error?: string;
  };
  if (!res.ok || !data.token) throw new Error(data.error || `login failed ${res.status}`);
  return data;
}

async function apiGet(token: string, path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const qaEmail = (process.env.ASSIST_EMAIL || "").trim();
  const qaPassword = (process.env.ASSIST_PASSWORD || "").trim();
  const vayushiPassword = (process.env.VAYUSHI_PASSWORD || "").trim();

  let token = "";
  let mode: "vayushi" | "admin-proxy" = "admin-proxy";
  let asEmail = "";

  if (vayushiPassword) {
    const logged = await login(VAYUSHI_EMAIL, vayushiPassword);
    token = logged.token!;
    asEmail = logged.user?.email || VAYUSHI_EMAIL;
    mode = "vayushi";
    pass("auth", `direct login ${asEmail}`);
  } else {
    if (!qaEmail || !qaPassword) throw new Error("Need ASSIST_EMAIL/PASSWORD or VAYUSHI_PASSWORD");
    const logged = await login(qaEmail, qaPassword);
    token = logged.token!;
    asEmail = logged.user?.email || qaEmail;
    mode = "admin-proxy";
    pass("auth", `admin proxy ${asEmail}`);
  }

  const leads = (await apiGet(token, "/api/admin/department-leads").catch(async (e) => {
    if (mode === "vayushi") {
      // Non-admin cannot hit admin leads — use ownership instead.
      return null;
    }
    throw e;
  })) as { leads?: { department: string; userId: string | null; userEmail: string | null; userName: string | null }[] } | null;

  if (leads?.leads) {
    const clinical = leads.leads.find((l) => l.department === "Clinical Operations");
    if (
      clinical?.userId === VAYUSHI_ID ||
      /vayushi/i.test(clinical?.userEmail || "") ||
      /vayushi/i.test(clinical?.userName || "")
    ) {
      pass(
        "vayushi-is-clinical-lead",
        `${clinical?.userName} <${clinical?.userEmail}>`,
      );
    } else {
      fail("vayushi-is-clinical-lead", JSON.stringify(clinical));
    }
  }

  if (mode === "vayushi") {
    const ownership = (await apiGet(token, "/api/knowledge/sops/my-ownership")) as {
      departments?: string[];
    };
    const depts = ownership.departments || [];
    if (depts.includes("Clinical Operations")) pass("clinical-ownership", depts.join(", "));
    else fail("clinical-ownership", depts.join("|") || "(none)");
  }

  const gapsPayload = (await apiGet(token, "/api/assist/gaps")) as {
    gaps?: {
      id: string;
      department: string;
      departmentSlug?: string;
      taskLabel: string;
      createdAt: string;
    }[];
  };
  const gaps = gapsPayload.gaps || [];

  const sopsPayload = (await apiGet(
    token,
    "/api/knowledge/sops?department=Clinical%20Operations&status=pending_review",
  )) as {
    sops?: {
      id: string;
      department: string;
      title: string;
      status: string;
      submittedAt?: string | null;
      createdAt: string;
    }[];
  };
  const sops = sopsPayload.sops || [];

  const items = buildLeadFocusItems({ gaps, sops });
  const { preview, moreCount, total } = capLeadFocusItems(items, YOUR_FOCUS_CAP);

  pass("gaps-in-inbox", `${items.filter((i) => i.kind === "gap").length} clinical gaps (api rows ${gaps.length})`);
  pass("sops-in-inbox", `${items.filter((i) => i.kind === "sop").length} pending SOPs (api ${sops.length})`);

  if (total >= 1) pass("inbox-nonempty", `total=${total}`);
  else fail("inbox-nonempty", "empty — unexpected while prod has clinical backlog");

  if (preview.length <= YOUR_FOCUS_CAP) pass("cap-5", `preview=${preview.length} more=+${moreCount}`);
  else fail("cap-5", `preview=${preview.length}`);

  if (total > YOUR_FOCUS_CAP) {
    if (moreCount === total - YOUR_FOCUS_CAP) pass("plus-n-more", `+${moreCount}`);
    else fail("plus-n-more", `moreCount=${moreCount}`);
  } else {
    pass("plus-n-more", `no overflow (total=${total})`);
  }

  let orderOk = true;
  for (let i = 1; i < items.length; i++) {
    if (items[i].sortAt < items[i - 1].sortAt) {
      orderOk = false;
      fail("oldest-first", `${items[i - 1].sortAt} > ${items[i].sortAt}`);
      break;
    }
  }
  if (orderOk) {
    pass(
      "oldest-first",
      items.map((i) => `${i.kind}:${i.title.slice(0, 36)}`).join(" → "),
    );
  }

  const gapHrefOk = preview
    .filter((i) => i.kind === "gap")
    .every((i) => i.href.includes("/lead/your-focus/gap/"));
  const sopHrefOk = preview
    .filter((i) => i.kind === "sop")
    .every((i) => i.href.includes("/memory/knowledge/sops?edit="));
  if (gapHrefOk && sopHrefOk) pass("actionable-hrefs", "gap→detail · sop→?edit=");
  else fail("actionable-hrefs", JSON.stringify(preview.map((p) => p.href)));

  const outDir = resolve(process.cwd(), "apps/hipaa-training/.cursor-verify");
  mkdirSync(outDir, { recursive: true });
  const out = {
    at: new Date().toISOString(),
    mode,
    as: asEmail,
    clinicalLeadConfirmed: rows.some((r) => r.id === "vayushi-is-clinical-lead" && r.pass),
    total,
    moreCount,
    preview,
    all: items,
    passed: rows.filter((r) => r.pass).length,
    totalChecks: rows.length,
    rows,
  };
  writeFileSync(resolve(outDir, "clinical-your-focus.json"), JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outDir}/clinical-your-focus.json`);
  console.log(`mode=${mode} total=${total} preview=${preview.length} +${moreCount}`);

  if (rows.some((r) => !r.pass)) {
    console.error("verify-clinical-your-focus: FAIL");
    process.exit(1);
  }
  console.log("verify-clinical-your-focus: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
