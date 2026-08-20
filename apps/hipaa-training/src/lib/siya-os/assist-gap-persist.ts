/**
 * Persist Assist knowledge gaps to auth API + optional founder instant email.
 * Never stores or emails verbatim question text on auto-capture.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { sendAutoGapFounderEmail, escalationInbox } from "@/lib/siya-os/escalation-email";

export type AssistGapSignalType = "no_match" | "notify_owner" | "thumbs_down" | "unresolved_repeat";

export type PersistAssistGapResult = {
  ok: boolean;
  id?: string;
  persistStatus?: number;
  persistError?: string;
  digestEligible?: boolean;
  emailSent?: boolean;
  emailTo?: string;
  emailError?: string;
  route?: {
    mode: "lead_digest" | "founder_instant";
    departmentLabel?: string;
    reason?: string;
    leadName?: string | null;
  };
  gap?: { id: string; department: string; departmentSlug: string; taskLabel: string; status: string; signalType?: string };
};

export async function persistAssistGap(opts: {
  token: string;
  department: string;
  task: string;
  signalType: AssistGapSignalType;
  /** Auto-capture: never pass question text. Notify-owner path may set this for click emails only. */
  phiRedacted?: boolean;
  id?: string;
  /** When true and route is founder_instant, send PHI-safe email (date/time/category only). */
  sendFounderInstantEmail?: boolean;
  chatCategory?: string;
}): Promise<PersistAssistGapResult> {
  const base = getTrainingApiUrl();
  if (!base) return { ok: false, persistError: "API URL not configured" };

  const id = opts.id || `gap-${Date.now()}`;
  try {
    const res = await fetch(`${base}/api/assist/gaps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${opts.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        department: opts.department,
        task: opts.task,
        phiRedacted: opts.phiRedacted ?? true,
        signalType: opts.signalType,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as PersistAssistGapResult & { error?: string };
    if (!res.ok) {
      return {
        ok: false,
        persistStatus: res.status,
        persistError: data.error || res.statusText,
      };
    }

    const route = data.route;
    let emailSent = false;
    let emailError: string | undefined;
    if (opts.sendFounderInstantEmail && route?.mode === "founder_instant") {
      const email = await sendAutoGapFounderEmail({
        recordId: data.id || id,
        department: route.departmentLabel || opts.department,
        task: opts.task,
        chatCategory: opts.chatCategory || `${opts.department} · ${opts.task}`,
        signalType: opts.signalType,
      });
      emailSent = email.sent;
      emailError = email.error;
    }

    return {
      ok: true,
      id: data.id || id,
      gap: data.gap,
      digestEligible: data.digestEligible,
      route,
      emailSent,
      emailTo: emailSent ? escalationInbox() : undefined,
      emailError,
    };
  } catch (err) {
    return {
      ok: false,
      persistError: err instanceof Error ? err.message : "persist threw",
    };
  }
}
