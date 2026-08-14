/**
 * Netflix-style brand intro — plays on every login / My day load.
 * Skip-once only avoids a double splash when login → My day in the same hop.
 */

const SKIP_ONCE_KEY = "siya-brand-intro-skip-once";

/** QA: `?previewIntro=1` always forces splash. */
export function isBrandIntroPreviewQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("previewIntro") === "1";
}

/** True every load, except the one navigation right after login splash → home. */
export function shouldShowBrandIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (isBrandIntroPreviewQuery()) return true;
  try {
    if (sessionStorage.getItem(SKIP_ONCE_KEY) === "1") {
      sessionStorage.removeItem(SKIP_ONCE_KEY);
      return false;
    }
  } catch {
    /* private mode */
  }
  return true;
}

/** @deprecated Use shouldShowBrandIntro — kept for existing call sites. */
export function shouldShowBrandIntroToday(): boolean {
  return shouldShowBrandIntro();
}

/** After login splash + sign-in, skip one My day splash in the same hop. */
export function skipBrandIntroOnce(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SKIP_ONCE_KEY, "1");
  } catch {
    /* private mode */
  }
}

/** No longer daily-gated — kept as a no-op so splash remounts stay simple. */
export function markBrandIntroShownToday(): void {
  /* every-load intro — nothing to persist */
}

/** Splash tagline — company startup moment (not the My day product line). */
export const BRAND_INTRO_TAGLINE = "Smart innovations for your aspirations.";

/**
 * Future sound toggle — keep false for office / autoplay safety.
 * Wire a short chime here later without changing splash timing.
 */
export const BRAND_INTRO_SOUND_ENABLED = false;
