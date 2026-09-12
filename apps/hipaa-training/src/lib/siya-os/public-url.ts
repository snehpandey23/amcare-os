/**
 * Staff-facing URL for Siya Assistant (internal helpdesk).
 * Not siya.health (patients). Not siya-guide (public Guide).
 *
 * Canonical: https://www.siyahealth.net
 * Legacy bookmark host siya-staff-assist.vercel.app 301s here.
 */
const DEFAULT_STAFF_URL = "https://www.siyahealth.net";

export const SIYA_ASSISTANT_CANONICAL_URL = (
  process.env.NEXT_PUBLIC_SIYA_ASSISTANT_URL ||
  process.env.NEXT_PUBLIC_SIYA_STAFF_LOGIN_URL?.replace(/\/login\/?$/, "") ||
  DEFAULT_STAFF_URL
).replace(/\/$/, "");

/** Legacy Vercel hostname — still 301s to the canonical staff URL. */
export const SIYA_ASSISTANT_FALLBACK_URL = "https://siya-staff-assist.vercel.app";
