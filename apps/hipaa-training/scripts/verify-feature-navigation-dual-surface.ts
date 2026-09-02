/**
 * Dual-surface verify — deterministic feature navigation (Ask + Talk).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-feature-navigation-dual-surface.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  buildCapabilityCatalogReply,
  featureCatalogFeatureCount,
  PORTAL_FEATURES,
  tryFeatureNavigation,
} from "../src/lib/siya-os/feature-navigation";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(process.cwd(), ".cursor-verify/feature-navigation-dual-surface.json");

const SOFT_STOP = /right staff guide for that yet|No approved guide yet/i;

type Case = {
  id: string;
  message: string;
  mustMatch: RegExp;
  mustNot?: RegExp;
  linkHref?: string;
  /** Broad catalog — expect N feature rows in body */
  catalogMinFeatures?: number;
};

const CASES: Case[] = [
  {
    id: "open-feedback",
    message: "open feedback",
    mustMatch: /Feedback Friday|peer feedback/i,
    mustNot: SOFT_STOP,
    linkHref: "/feedback",
  },
  {
    id: "show-performance",
    message: "show my performance",
    mustMatch: /Weekly practice report|practice performance/i,
    mustNot: SOFT_STOP,
    linkHref: "/learn/practice",
  },
  {
    id: "what-can-this-do",
    message: "what can this do",
    mustMatch: /everything reachable|Learn & training|Practice drills|Memory/i,
    mustNot: SOFT_STOP,
    catalogMinFeatures: 20,
  },
  {
    id: "open-hipaa",
    message: "open HIPAA training",
    mustMatch: /HIPAA certification|\/training/i,
    linkHref: "/training",
  },
  {
    id: "typing-drill",
    message: "start a typing drill",
    mustMatch: /Chat speed|typing/i,
    linkHref: "/learn/practice",
  },
  {
    id: "open-memory",
    message: "open memory",
    mustMatch: /Memory|\/memory/i,
    linkHref: "/memory",
  },
  {
    id: "practice-hub",
    message: "open practice drills",
    mustMatch: /Practice drills|\/learn\/practice/i,
    mustNot: /Learn → Practice.*skill drills.*not.*medical/i,
    linkHref: "/learn/practice",
  },
  {
    id: "show-everything",
    message: "show me everything this can do",
    mustMatch: /everything reachable/i,
    catalogMinFeatures: 20,
  },
];

type Row = {
  id: string;
  surface: string;
  pass: boolean;
  detail: string;
  task?: string;
  linkHrefs?: string[];
};

async function login() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function chat(token: string, message: string, surface: "default" | "founder-coach") {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, surface }),
  });
  const data = (await res.json()) as {
    reply?: string;
    message?: string;
    links?: { label: string; href: string }[];
    portalLinks?: { label: string; href: string }[];
    routing?: { task?: string };
    knowledgeGap?: boolean;
  };
  const text = data.reply ?? data.message ?? "";
  const links = data.links ?? data.portalLinks ?? [];
  return { text, links, task: data.routing?.task, knowledgeGap: data.knowledgeGap };
}

function countCatalogBullets(text: string): number {
  return (text.match(/^• \*\*/gm) ?? []).length;
}

async function main() {
  const token = await login();
  const rows: Row[] = [];
  const surfaces: ("default" | "founder-coach")[] = ["default", "founder-coach"];

  // Local deterministic sanity
  const adminCatalog = buildCapabilityCatalogReply({ isAdmin: true, isSignedIn: true });
  const staffCount = featureCatalogFeatureCount({ isAdmin: false, isSignedIn: true });
  const adminCount = featureCatalogFeatureCount({ isAdmin: true, isSignedIn: true });
  if (adminCount < PORTAL_FEATURES.length - 2) {
    throw new Error(`Catalog too small: admin=${adminCount} defs=${PORTAL_FEATURES.length}`);
  }
  if (!tryFeatureNavigation("open feedback")) throw new Error("local: open feedback miss");
  if (!tryFeatureNavigation("show my performance")) throw new Error("local: show my performance miss");

  console.log(`Local catalog: staff=${staffCount} admin=${adminCount} defs=${PORTAL_FEATURES.length}`);
  console.log(`Catalog preview lines: ${adminCatalog.message.split("\n").length}`);

  for (const c of CASES) {
    for (const surface of surfaces) {
      const { text, links, task, knowledgeGap } = await chat(token, c.message, surface);
      const hrefs = links.map((l) => l.href);
      let pass = c.mustMatch.test(text);
      if (c.mustNot && c.mustNot.test(text)) pass = false;
      if (c.linkHref && !hrefs.some((h) => h.includes(c.linkHref!))) pass = false;
      if (c.catalogMinFeatures) {
        const n = countCatalogBullets(text);
        if (n < c.catalogMinFeatures) {
          pass = false;
        }
      }
      if (knowledgeGap && SOFT_STOP.test(text)) pass = false;

      rows.push({
        id: c.id,
        surface,
        pass,
        detail: pass
          ? "ok"
          : `text=${text.slice(0, 120)}… links=${hrefs.join(",")} bullets=${countCatalogBullets(text)}`,
        task,
        linkHrefs: hrefs,
      });
      const mark = pass ? "PASS" : "FAIL";
      console.log(`${mark} [${surface}] ${c.id}: ${c.message}`);
    }
  }

  const passed = rows.filter((r) => r.pass).length;
  mkdirSync(resolve(process.cwd(), ".cursor-verify"), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        staffUrl: STAFF,
        featureDefs: PORTAL_FEATURES.length,
        staffCatalogCount: staffCount,
        adminCatalogCount: adminCount,
        passed,
        total: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`\n${passed}/${rows.length} passed → ${OUT}`);
  if (passed !== rows.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
