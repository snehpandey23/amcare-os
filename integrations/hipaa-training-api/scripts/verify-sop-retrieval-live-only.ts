/**
 * Live gate: GET /api/knowledge/sops/retrieval must return only status=live.
 * Run (with QA env): npx tsx scripts/verify-sop-retrieval-live-only.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(process.cwd(), "../../.env.agent-qa"));
loadEnvFile(resolve(process.cwd(), "../.env.agent-qa"));
loadEnvFile(resolve(process.cwd(), ".env.agent-qa"));

const API = (process.env.TRAINING_API_URL || process.env.NEXT_PUBLIC_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;
if (!email || !password) {
  console.error("QA_EMAIL / QA_PASSWORD required");
  process.exit(1);
}

async function main() {
  const login = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginBody = (await login.json()) as { token?: string; error?: string };
  if (!login.ok || !loginBody.token) throw new Error(`login failed: ${login.status} ${loginBody.error || ""}`);

  const res = await fetch(`${API}/api/knowledge/sops/retrieval`, {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  const body = (await res.json()) as { sops?: { id: string; title: string; status: string }[]; error?: string };
  if (!res.ok) throw new Error(`retrieval ${res.status} ${body.error || ""}`);

  const sops = body.sops || [];
  const byStatus = new Map<string, number>();
  for (const s of sops) byStatus.set(s.status, (byStatus.get(s.status) || 0) + 1);

  const bad = sops.filter((s) => s.status !== "live");
  console.log(
    JSON.stringify(
      {
        api: API,
        count: sops.length,
        byStatus: Object.fromEntries(byStatus),
        titles: sops.map((s) => ({ status: s.status, title: s.title.slice(0, 60) })),
      },
      null,
      2,
    ),
  );

  if (bad.length) {
    throw new Error(`FAIL: ${bad.length} non-live SOP(s) in retrieval: ${bad.map((s) => `${s.status}:${s.id}`).join(", ")}`);
  }
  if (sops.length === 0) {
    throw new Error("FAIL: expected at least one live SOP");
  }
  console.log(`PASS: retrieval live-only (${sops.length} live, 0 pending_review/needs_review/draft)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
