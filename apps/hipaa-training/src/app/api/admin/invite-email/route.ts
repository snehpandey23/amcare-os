import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { sendTeamInviteEmail } from "@/lib/invite-email";

const LOGIN_URL =
  process.env.NEXT_PUBLIC_SIYA_STAFF_LOGIN_URL?.trim() ||
  process.env.NEXT_PUBLIC_SIYA_ASSISTANT_URL?.trim() ||
  "https://siya-staff-assist.vercel.app/login";

async function requirePortalAdmin(req: Request): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Sign in required." };
  }
  const base = getTrainingApiUrl();
  if (!base) {
    return { ok: false, status: 503, error: "Training API URL not configured." };
  }
  const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
  if (!me.ok) {
    return { ok: false, status: 401, error: "Session expired — sign in again." };
  }
  const user = (await me.json()) as { role?: string };
  if (user.role !== "admin") {
    return { ok: false, status: 403, error: "Admin only." };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  const gate = await requirePortalAdmin(req);
  if (!gate.ok) {
    return Response.json({ error: gate.error }, { status: gate.status });
  }

  const body = await req.json().catch(() => ({}));
  const toEmail = typeof body?.toEmail === "string" ? body.toEmail.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const temporaryPassword =
    typeof body?.temporaryPassword === "string" ? body.temporaryPassword : "";
  const loginUrlOverride = typeof body?.loginUrl === "string" ? body.loginUrl.trim() : "";

  if (!toEmail || !temporaryPassword || temporaryPassword.length < 8) {
    return Response.json({ error: "toEmail and temporaryPassword (8+ chars) required." }, { status: 400 });
  }

  const result = await sendTeamInviteEmail({
    toEmail,
    name,
    temporaryPassword,
    loginUrl: loginUrlOverride || LOGIN_URL,
  });

  return Response.json({
    ok: true,
    emailSent: result.sent,
    emailError: result.error,
    loginUrl: loginUrlOverride || LOGIN_URL,
  });
}
