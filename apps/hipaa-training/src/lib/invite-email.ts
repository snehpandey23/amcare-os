/**
 * Team invite email (Resend). Requires RESEND_API_KEY on siya-staff-assist.
 */

import { escalationFromAddress } from "@/lib/siya-os/escalation-email";

export type TeamInviteEmailPayload = {
  toEmail: string;
  name: string;
  temporaryPassword: string;
  loginUrl: string;
};

export function inviteFromAddress(): string {
  return (
    process.env.SIYA_INVITE_FROM?.trim() ||
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    "Siya Staff Portal <onboarding@resend.dev>"
  );
}

export async function sendTeamInviteEmail(
  payload: TeamInviteEmailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      error: "RESEND_API_KEY is not set on Vercel (siya-staff-assist). Copy invite details manually.",
    };
  }

  const from = inviteFromAddress();
  const subject = "Your Siya staff portal login";
  const text = [
    `Hi ${payload.name || "there"},`,
    "",
    "An admin created your account for the internal Siya staff portal (help desk, training, Level Up).",
    "",
    `Sign in: ${payload.loginUrl}`,
    `Email: ${payload.toEmail}`,
    `Temporary password: ${payload.temporaryPassword}`,
    "",
    "Use a password manager. Change your password from Account after sign-in, or use Forgot password on the login page if locked out.",
    "Do not share this email — it contains credentials.",
    "",
    "— Siya Health internal systems —",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.toEmail.trim()],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      return { sent: false, error: err.message || `Resend HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

export function buildInviteCopyText(payload: TeamInviteEmailPayload): string {
  return [
    `Siya staff portal invite for ${payload.name}`,
    "",
    `Login: ${payload.loginUrl}`,
    `Email: ${payload.toEmail}`,
    `Temporary password: ${payload.temporaryPassword}`,
  ].join("\n");
}
