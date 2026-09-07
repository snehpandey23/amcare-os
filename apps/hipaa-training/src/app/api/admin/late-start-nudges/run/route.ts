/**
 * Admin force-run: late shift-start nudges (no local CRON_SECRET required).
 * Uses server CRON_SECRET to talk to auth-api, or admin candidate list.
 *
 * POST /api/admin/late-start-nudges/run
 * Body: { mode?: "test_recipient"|"dry_run"|"live"|"pilot", lookbackHours?: number, limit?: number, mark?: boolean }
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  resolveWeekdayEmailMode,
  sendLateStartNudgeEmail,
} from "@/lib/shift-late-start-nudge-email";

export const maxDuration = 120;

async function requirePortalAdmin(req: Request): Promise<
  | { ok: true; auth: string }
  | { ok: false; status: number; error: string }
> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Sign in required." };
  }
  const base = getTrainingApiUrl();
  if (!base) return { ok: false, status: 503, error: "Training API URL not configured." };
  const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
  if (!me.ok) return { ok: false, status: 401, error: "Session expired — sign in again." };
  const user = (await me.json()) as { role?: string };
  if (user.role !== "admin") return { ok: false, status: 403, error: "Admin only." };
  return { ok: true, auth };
}

type Recipient = {
  role: "staff" | "department_lead" | "hr" | "admin";
  email: string;
  userId?: string | null;
  name?: string | null;
};

type Candidate = {
  rosterRowId: string;
  userId: string;
  email: string;
  name: string | null;
  firstName: string;
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
  minutesLate: number;
  recipients: Recipient[];
};

async function fetchCandidatesAdmin(auth: string, lookbackHours: number): Promise<Candidate[]> {
  const base = getTrainingApiUrl();
  const res = await fetch(
    `${base}/api/admin/shift/late-start-nudge-candidates?lookbackHours=${lookbackHours}`,
    { headers: { Authorization: auth } },
  );
  const data = (await res.json().catch(() => ({}))) as {
    candidates?: Candidate[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `Candidates HTTP ${res.status}`);
  return data.candidates || [];
}

async function markSent(
  auth: string,
  opts: {
    rosterRowId: string;
    userId: string;
    recipientEmails: string[];
    recipientRoles: string[];
    resendIds: string[];
  },
) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (secret) {
    const res = await fetch(`${base}/api/internal/shift-late-start-nudges/mark-sent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "x-cron-secret": secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opts),
    });
    if (res.ok) return { marked: true as const };
  }
  // Admin JWT fallback (no cron secret needed on the caller machine)
  const res = await fetch(`${base}/api/admin/shift/late-start-nudge-mark-sent`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { marked: false as const, reason: data.error || `mark HTTP ${res.status}` };
  }
  return { marked: true as const };
}

export async function POST(req: Request) {
  const gate = await requirePortalAdmin(req);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  const body = (await req.json().catch(() => ({}))) as {
    mode?: string;
    lookbackHours?: number;
    limit?: number;
    mark?: boolean;
  };

  // Default test_recipient so we don't spam all staff inboxes during founder force-run.
  const mode = resolveWeekdayEmailMode(body.mode || "test_recipient");
  const lookbackHours =
    typeof body.lookbackHours === "number" && body.lookbackHours > 0
      ? Math.min(168, Math.floor(body.lookbackHours))
      : 72;
  const limit =
    typeof body.limit === "number" && body.limit > 0 ? Math.min(10, Math.floor(body.limit)) : 3;
  const shouldMark = body.mark !== false;

  try {
    const candidates = (await fetchCandidatesAdmin(gate.auth, lookbackHours)).slice(0, limit);
    if (!candidates.length) {
      return Response.json({
        ok: true,
        mode,
        lookbackHours,
        candidateCount: 0,
        note: "No late candidates in lookback (everyone checked in, or no roster starts ≥1h ago). Cron path is live; nothing to nudge right now.",
        results: [],
      });
    }

    const results: unknown[] = [];
    for (const c of candidates) {
      const staffName = (c.name && c.name.trim()) || c.firstName || c.email;
      const recipients = c.recipients || [];
      const sendResults = [];
      for (const r of recipients) {
        const send = await sendLateStartNudgeEmail({
          to: r.email,
          role: r.role,
          staffName,
          staffEmail: c.email,
          shiftStart: c.shiftStart,
          shiftEnd: c.shiftEnd,
          rawCell: c.rawCell,
          minutesLate: c.minutesLate,
          mode,
        });
        sendResults.push(send);
      }

      const anySent = sendResults.some((s) => s.sent);
      const dryOk = mode === "dry_run" && sendResults.length > 0;
      let markResult: { marked: boolean; reason?: string } | null = null;
      if (shouldMark && (anySent || (dryOk && body.mark === true))) {
        markResult = await markSent(gate.auth, {
          rosterRowId: c.rosterRowId,
          userId: c.userId,
          recipientEmails: sendResults.map((s) => s.wouldSendTo || s.to || "").filter(Boolean),
          recipientRoles: sendResults.map((s) => s.role),
          resendIds: sendResults.map((s) => s.resendId || "").filter(Boolean),
        });
      }

      results.push({
        rosterRowId: c.rosterRowId,
        email: c.email,
        minutesLate: c.minutesLate,
        shiftStart: c.shiftStart,
        recipientCount: recipients.length,
        roles: recipients.map((r) => r.role),
        sends: sendResults,
        mark: markResult,
      });
    }

    return Response.json({
      ok: true,
      mode,
      lookbackHours,
      candidateCount: candidates.length,
      results,
    });
  } catch (e) {
    console.error("[admin/late-start-nudges/run]", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Run failed" },
      { status: 500 },
    );
  }
}
