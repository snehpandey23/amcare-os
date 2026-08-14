/** Client-side training API configuration (public env only). */

function directTrainingApiUrl(): string | null {
  // Server routes should prefer the non-public URL (same as next.config rewrites).
  const u =
    (typeof window === "undefined" ? process.env.HIPAA_TRAINING_API_URL?.trim() : "") ||
    process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim();
  return u || null;
}

/**
 * Browser calls same-origin `/api/staff-auth/*` (rewritten to auth API) so login works
 * when networks block a second `*.vercel.app` hostname. Server may use direct URL.
 */
export function getTrainingApiUrl(): string | null {
  const direct = directTrainingApiUrl();
  if (!direct) return null;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/staff-auth`;
  }
  return direct.replace(/\/$/, "");
}

/** When set, users must sign in for /training routes; help desk (/) stays open. */
export function isTrainingAuthRequired(): boolean {
  return !!directTrainingApiUrl() && process.env.NEXT_PUBLIC_HIPAA_TRAINING_REQUIRE_AUTH === "true";
}

/** API URL configured — accounts + cloud sync available. */
export function isPortalAuthEnabled(): boolean {
  return !!directTrainingApiUrl();
}

/** Employee portal: sign in required for home, Ask, Level Up, and training. */
export function isPortalLoginRequired(): boolean {
  return isPortalAuthEnabled() && process.env.NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN === "1";
}

/** Pilot mode: skip forced onboarding wizard so staff can test shift / My day / tasks first. */
export function isPortalOnboardingPaused(): boolean {
  return process.env.NEXT_PUBLIC_SIYA_PORTAL_PAUSE_ONBOARDING === "1";
}

/**
 * Org memory pillar (/memory — Way, Policies, Knowledge/decision log, captures).
 * On by default: Ask citation deep links target /memory?tab=…; a hard-off gate sent those clicks to My Day.
 * Set NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED=0 only to hide the pillar intentionally.
 */
export function isPortalMemoryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED !== "0";
}

export function isPublicRegistrationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER === "true";
}

export const AUTH_TOKEN_STORAGE_KEY = "hipaa-training-jwt";
