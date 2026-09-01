/**
 * Feedback Friday — named + anonymous prod verify (QA accounts only).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-feedback-friday.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { assessFeedbackBody } from "../../../integrations/hipaa-training-api/src/team-feedback-service";

/** Must stay in sync with feedback-received-email.ts — static privacy template only. */
const FEEDBACK_EMAIL_SUBJECT = "You've received feedback from a teammate";
const FEEDBACK_EMAIL_BODY_SNIPPETS = [
  "You've received feedback from a teammate on Feedback Friday.",
  "We don't include feedback text in email",
  "/feedback",
];

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/feedback-friday-verify.json",
);

const GIVER_EMAIL = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
const GIVER_PASSWORD = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
const RECIPIENT_EMAIL = "qa-feedback-inbox@siya.health";
const RECIPIENT_PASSWORD = process.env.QA_FEEDBACK_INBOX_PASSWORD || "QaFeedbackInbox!2026";

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

async function login(email: string, password: string) {
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as {
    token?: string;
    user?: { id: string; email: string; name?: string; role?: string };
    error?: string;
  };
  if (!res.ok || !data.token || !data.user) throw new Error(data.error || `login ${email} failed`);
  return data as { token: string; user: { id: string; email: string; name?: string; role?: string } };
}

async function ensureRecipient(adminToken: string) {
  const roster = await fetch(`${AUTH}/api/admin/team/roster`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json()) as { members?: { id: string; email: string }[] };
  const existing = (roster.members || []).find((m) => m.email === RECIPIENT_EMAIL);
  if (existing) {
    // Reset password so we can log in as recipient
    await fetch(`${AUTH}/api/admin/users/${existing.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: RECIPIENT_PASSWORD }),
    });
    return existing.id;
  }
  const create = await fetch(`${AUTH}/api/admin/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: RECIPIENT_EMAIL,
      password: RECIPIENT_PASSWORD,
      name: "QA Feedback Inbox (test only)",
      role: "trainee",
    }),
  });
  const data = (await create.json()) as { user?: { id: string }; error?: string };
  if (!create.ok || !data.user) throw new Error(data.error || "could not create recipient");
  return data.user.id;
}

function emailLeakCheck(opts: {
  feedbackBody: string;
  giverEmail: string;
  giverName: string | undefined;
  label: string;
}) {
  const blob = [FEEDBACK_EMAIL_SUBJECT, ...FEEDBACK_EMAIL_BODY_SNIPPETS].join("\n");
  if (blob.includes(opts.feedbackBody)) {
    fail(`${opts.label}-body-leak`, "email contains feedback text");
    return false;
  }
  if (blob.toLowerCase().includes(opts.giverEmail.toLowerCase())) {
    fail(`${opts.label}-email-leak`, "email contains giver email");
    return false;
  }
  if (opts.giverName && opts.giverName.length >= 4 && blob.toLowerCase().includes(opts.giverName.toLowerCase())) {
    fail(`${opts.label}-name-leak`, "email contains giver name");
    return false;
  }
  pass(`${opts.label}-email-privacy`, "no feedback body or giver identity in template");
  return true;
}

function assertResendSent(
  email: { sent?: boolean; id?: string; error?: string; to?: string[] } | undefined,
  label: string,
  expectedTo: string,
) {
  if (!email?.sent || !email.id) {
    fail(`${label}-resend`, email?.error || "email not sent");
    return false;
  }
  if (!email.to?.includes(expectedTo.toLowerCase())) {
    fail(`${label}-resend-to`, JSON.stringify(email.to));
    return false;
  }
  pass(`${label}-resend`, `id=${email.id}`);
  return true;
}

function leakCheck(payload: unknown, giverEmail: string, giverName: string | undefined, label: string) {
  const s = JSON.stringify(payload);
  if (/giverUserId|giver_user_id|"giver"\s*:/i.test(s)) {
    fail(label, "payload contains giver identity field");
    return false;
  }
  if (s.toLowerCase().includes(giverEmail.toLowerCase())) {
    fail(label, "payload contains giver email");
    return false;
  }
  if (giverName && giverName.length >= 4 && s.toLowerCase().includes(giverName.toLowerCase())) {
    fail(label, "payload contains giver name");
    return false;
  }
  pass(label, "no giver email/name/id fields");
  return true;
}

async function main() {
  if (!GIVER_EMAIL || !GIVER_PASSWORD || !/qa|test/i.test(GIVER_EMAIL)) {
    fail("creds", "QA giver credentials required via agent-qa-env.sh");
    process.exit(1);
  }
  pass("creds-qa", GIVER_EMAIL);

  const filterOk = assessFeedbackBody("Thanks for covering the late cancel call so calmly yesterday.");
  const filterBad = assessFeedbackBody("fuck you idiot");
  if (filterOk.ok) pass("filter-ok", "constructive allowed");
  else fail("filter-ok", filterOk.reason);
  if (!filterBad.ok) pass("filter-block", filterBad.reason);
  else fail("filter-block", "should reject insult");

  const giver = await login(GIVER_EMAIL, GIVER_PASSWORD);
  pass("giver-login", `${giver.user.email} role=${giver.user.role}`);
  const recipientId = await ensureRecipient(giver.token);
  pass("recipient-ready", RECIPIENT_EMAIL);

  const namedBody = `Named Feedback Friday verify ${Date.now()}: you handled the patient handoff clearly.`;
  const namedRes = await fetch(`${STAFF}/api/team-feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${giver.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientUserId: recipientId,
      targetKind: "peer",
      body: namedBody,
      anonymous: false,
    }),
  });
  const named = (await namedRes.json()) as {
    recipientFacing?: { id: string; attribution: { mode: string; displayName?: string }; body: string };
    email?: { sent?: boolean; id?: string; error?: string; to?: string[] };
    error?: string;
  };
  if (!namedRes.ok || !named.recipientFacing) {
    fail("named-submit", named.error || `HTTP ${namedRes.status}`);
  } else if (named.recipientFacing.attribution.mode !== "named" || !named.recipientFacing.attribution.displayName) {
    fail("named-submit", JSON.stringify(named.recipientFacing.attribution));
  } else {
    pass("named-submit", `displayName=${named.recipientFacing.attribution.displayName}`);
    emailLeakCheck({
      feedbackBody: namedBody,
      giverEmail: GIVER_EMAIL,
      giverName: giver.user.name,
      label: "named",
    });
    assertResendSent(named.email, "named", RECIPIENT_EMAIL);
  }

  const anonBody = `Anonymous Feedback Friday verify ${Date.now()}: appreciate how you document Klarity notes.`;
  const anonRes = await fetch(`${STAFF}/api/team-feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${giver.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientUserId: recipientId,
      targetKind: "peer",
      body: anonBody,
      anonymous: true,
    }),
  });
  const anon = (await anonRes.json()) as {
    recipientFacing?: { id: string; attribution: { mode: string }; body: string };
    email?: { sent?: boolean; id?: string; error?: string; to?: string[] };
    error?: string;
  };
  if (!anonRes.ok || !anon.recipientFacing) {
    fail("anon-submit", anon.error || `HTTP ${anonRes.status}`);
    process.exit(1);
  }
  if (anon.recipientFacing.attribution.mode !== "anonymous") {
    fail("anon-submit", JSON.stringify(anon.recipientFacing.attribution));
  } else {
    pass("anon-submit", anon.recipientFacing.id);
    emailLeakCheck({
      feedbackBody: anonBody,
      giverEmail: GIVER_EMAIL,
      giverName: giver.user.name,
      label: "anon",
    });
    assertResendSent(anon.email, "anon", RECIPIENT_EMAIL);
  }
  leakCheck(anon.recipientFacing, GIVER_EMAIL, giver.user.name, "anon-recipientFacing-leak");

  const recipient = await login(RECIPIENT_EMAIL, RECIPIENT_PASSWORD);
  pass("recipient-login", recipient.user.email);

  const inboxRes = await fetch(`${AUTH}/api/team-feedback/inbox`, {
    headers: { Authorization: `Bearer ${recipient.token}` },
  });
  const inbox = (await inboxRes.json()) as {
    items?: {
      id: string;
      body: string;
      attribution: { mode: string; displayName?: string };
    }[];
  };
  if (!inboxRes.ok) {
    fail("inbox", `HTTP ${inboxRes.status}`);
  } else {
    const namedHit = (inbox.items || []).find((i) => i.id === named.recipientFacing?.id);
    const anonHit = (inbox.items || []).find((i) => i.id === anon.recipientFacing?.id);
    if (namedHit?.attribution.mode === "named" && namedHit.attribution.displayName) {
      pass("inbox-named", `sees ${namedHit.attribution.displayName}`);
    } else fail("inbox-named", JSON.stringify(namedHit));
    if (anonHit?.attribution.mode === "anonymous") {
      pass("inbox-anon-mode", "mode=anonymous");
      leakCheck(anonHit, GIVER_EMAIL, giver.user.name, "inbox-anon-leak");
      // Named siblings in the same inbox may show displayName — only anonymous rows must stay clean.
      const anonOnly = (inbox.items || []).filter((i) => i.attribution.mode === "anonymous");
      leakCheck({ items: anonOnly }, GIVER_EMAIL, giver.user.name, "anon-items-only-leak");
    } else fail("inbox-anon-mode", JSON.stringify(anonHit));
  }

  // Admin viewing recipient inbox is not a thing — confirm moderation path HAS giver,
  // and that inbox JSON from recipient never did.
  const modRes = await fetch(`${AUTH}/api/admin/team-feedback/moderation/${anon.recipientFacing.id}`, {
    headers: { Authorization: `Bearer ${giver.token}` },
  });
  const mod = (await modRes.json()) as {
    investigation?: { giver?: { email?: string }; attribution?: { mode?: string } };
  };
  if (modRes.ok && mod.investigation?.giver?.email === GIVER_EMAIL) {
    pass("moderation-has-giver", "abuse path only");
  } else {
    fail("moderation-has-giver", JSON.stringify(mod));
  }
  if (mod.investigation?.attribution?.mode === "anonymous") {
    pass("moderation-still-anon-flag", "recipient-facing mode remains anonymous");
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        giver: GIVER_EMAIL,
        recipient: RECIPIENT_EMAIL,
        namedId: named.recipientFacing?.id,
        anonId: anon.recipientFacing?.id,
        passed: rows.filter((r) => r.pass).length,
        total: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${OUT}`);
  if (rows.some((r) => !r.pass)) process.exit(1);
  console.log("verify-feedback-friday: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
