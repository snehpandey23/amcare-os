/**
 * Staff-facing URL for Siya Assistant (internal helpdesk).
 * Not siya.health (patients). Not siya-guide (public Guide).
 *
 * Target: https://siya-staff-assist.vercel.app (Vercel project siya-staff-assist — no DNS).
 * `siya-assistant.vercel.app` is taken by another Vercel account — do not use.
 */
const DEFAULT_STAFF_URL = "https://siya-staff-assist.vercel.app";

export const SIYA_ASSISTANT_CANONICAL_URL = (
  process.env.NEXT_PUBLIC_SIYA_ASSISTANT_URL || DEFAULT_STAFF_URL
).replace(/\/$/, "");

/** Deployment that works today while DNS for assist.siya.health is pending. */
export const SIYA_ASSISTANT_FALLBACK_URL = "https://hipaa-training-eight.vercel.app";
