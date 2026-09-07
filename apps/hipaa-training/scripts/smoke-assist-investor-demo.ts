/**
 * Investor demo lock — phrases from ASSIST-INVESTOR-READY.md must never soft-stop
 * or route life-threat to abusive SOP. Dual-surface (Ask + Founder Talk).
 *
 *   source ../../scripts/agent-qa-env.sh
 *   cd apps/hipaa-training && npx tsx scripts/smoke-assist-investor-demo.ts
 *
 * Optional live prod: ASSIST_DEMO_LIVE=1 (hits /api/chat on siya-staff-assist)
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";

import assert from "node:assert/strict";
import { runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

const SOFT = /right staff guide for that yet|No approved guide yet/i;
const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";
const LIVE = process.env.ASSIST_DEMO_LIVE === "1";
const BASE = "https://siya-staff-assist.vercel.app";

type Case = {
  message: string;
  must: RegExp;
  mustNot?: RegExp;
  refuseOk?: boolean;
};

const CASES: Case[] = [
  {
    message:
      "what should i tell to the patient if he is saying he is feeling chest pain anxiety",
    must: /911|urgent care|ER|red-flag|emergency|provider/i,
    mustNot: /verbally abusive|right staff guide for that yet/i,
  },
  {
    message: "abusive patient yelling on the phone — what do I do?",
    must: /abusive|hostile|boundary|supervisor|Clinical Program|end the/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    message: "who is on duty tomorrow",
    must: /MA duty roster|on duty|team view|admins and department leads/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    message: "when do I work this week",
    must: /schedule|this week|shift_roster|No schedule data/i,
    mustNot: /right staff guide for that yet/i,
  },
  {
    message: "Patient MRN is 123456",
    must: /MRN|EHR|patient names|approved EHR|identifiers/i,
    refuseOk: true,
  },
];

async function login(): Promise<string> {
  assert.ok(email && password, "ASSIST_EMAIL / ASSIST_PASSWORD required");
  const API = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL!;
  const login = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json() as Promise<{ token?: string }>);
  assert.ok(login.token, "login failed");
  return login.token!;
}

async function liveChat(token: string, message: string, surface: string) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, surface, history: [] }),
  });
  const json = (await res.json()) as {
    message?: string;
    reply?: string;
    knowledgeGap?: boolean;
    refused?: boolean;
  };
  assert.ok(res.ok, `live chat ${res.status}`);
  return {
    message: String(json.reply || json.message || ""),
    knowledgeGap: json.knowledgeGap,
    refused: json.refused,
  };
}

async function main() {
  const token = await login();
  let fails = 0;

  for (const surface of ["default", "founder-coach"] as const) {
    for (const c of CASES) {
      const label = `${LIVE ? "live" : "engine"} ${surface}: ${c.message.slice(0, 48)}`;
      const r = LIVE
        ? await liveChat(token, c.message, surface)
        : await runSiyaAssistantAsync(c.message, [], {
            authToken: token,
            surface,
          });
      const msg = r.message || "";
      try {
        if (!c.refuseOk) {
          assert.ok(!SOFT.test(msg), `${label} soft-stop`);
          assert.ok(!(r as { knowledgeGap?: boolean }).knowledgeGap, `${label} knowledgeGap`);
        }
        assert.match(msg, c.must, `${label} must`);
        if (c.mustNot) assert.doesNotMatch(msg, c.mustNot, `${label} mustNot`);
        console.log(`OK\t${label}`);
      } catch (e) {
        fails += 1;
        console.error(`FAIL\t${label}\t${msg.slice(0, 160).replace(/\n/g, " ")}`);
        console.error(e);
      }
    }
  }

  if (fails) {
    console.error(`smoke-assist-investor-demo: ${fails} FAIL`);
    process.exit(1);
  }
  console.log("smoke-assist-investor-demo: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
