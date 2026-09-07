import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  sendLateStartNudgeEmail,
} from "@/lib/shift-late-start-nudge-email";

export const maxDuration = 120;

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
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

async function fetchCandidates(): Promise<Candidate[]> {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) throw new Error("API or CRON_SECRET not configured");
  const res = await fetch(`${base}/api/internal/shift-late-start-nudges`, {
    headers: { Authorization: `Bearer ${secret}`, "x-cron-secret": secret },
  });
  const data = (await res.json().catch(() => ({}))) as {
    candidates?: Candidate[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "Could not load late-start candidates");
  return data.candidates || [];
}

async function markSent(opts: {
  rosterRowId: string;
  userId: string;
  recipientEmails: string[];
  recipientRoles: string[];
  resendIds: string[];
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) return;
  await fetch(`${base}/api/internal/shift-late-start-nudges/mark-sent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "x-cron-secret": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = resolveWeekdayEmailMode(url.searchParams.get("mode"));
  /** Optional: force a synthetic 4-party send for verification (does not invent roster). */
  const simulate = url.searchParams.get("simulate") === "1";

  try {
    let candidates = await fetchCandidates();
    if (simulate && candidates.length === 0) {
      // Synthetic candidate for evidence — emails resolved from live API still preferred;
      // fall back to empty so cron does not invent phantom staff without roster.
      return Response.json({
        ok: true,
        mode,
        note: "simulate=1 but no live late candidates; insert a roster row >1h late with no Start to test",
        candidateCount: 0,
        results: [],
      });
    }

    const results: unknown[] = [];
    for (const c of candidates) {
      const staffName = (c.name && c.name.trim()) || c.firstName || c.email;
      const recipients = c.recipients || [];
      // Apply mode filter only to staff email for pilot allowlist; always attempt all roles in live/test
      const staffFiltered = filterRecipientsForMode([{ email: c.email }], mode);
      if (mode === "pilot" && staffFiltered.length === 0) {
        results.push({ rosterRowId: c.rosterRowId, skipped: true, reason: "staff_not_in_pilot" });
        continue;
      }

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
      if (anySent || dryOk) {
        // Mark once after attempting all four — prevents repeat even if some roles failed
        if (anySent || (dryOk && url.searchParams.get("markDry") === "1")) {
          await markSent({
            rosterRowId: c.rosterRowId,
            userId: c.userId,
            recipientEmails: sendResults.map((s) => s.wouldSendTo || s.to || "").filter(Boolean),
            recipientRoles: sendResults.map((s) => s.role),
            resendIds: sendResults.map((s) => s.resendId || "").filter(Boolean),
          });
        }
      }

      results.push({
        rosterRowId: c.rosterRowId,
        email: c.email,
        minutesLate: c.minutesLate,
        recipientCount: recipients.length,
        roles: recipients.map((r) => r.role),
        sends: sendResults,
      });
    }

    // Second pass check: already-marked candidates must not reappear
    const again = await fetchCandidates();
    const repeatIds = again
      .map((c) => c.rosterRowId)
      .filter((id) => results.some((r) => (r as { rosterRowId?: string }).rosterRowId === id));

    return Response.json({
      ok: true,
      mode,
      candidateCount: candidates.length,
      results,
      repeatWouldFire: repeatIds,
      oneTimeConfirmed: results.length === 0 || (anyMarked(results) && repeatIds.length === 0),
    });
  } catch (e) {
    console.error("[cron/shift-late-start-nudges]", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 },
    );
  }
}

function anyMarked(results: unknown[]): boolean {
  return results.some((r) => {
    const row = r as { sends?: { sent?: boolean }[] };
    return row.sends?.some((s) => s.sent);
  });
}
