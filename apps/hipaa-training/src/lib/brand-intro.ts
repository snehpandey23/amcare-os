/**
 * Brand intro — once per local calendar day (localStorage).
 * Skip-once avoids a double splash on the login → My day hop.
 * Sign-out must not clear the date key — the daily gate survives logout.
 * Product tour in progress: skip splash for that session (do not layer over coach bar).
 */

import { isPortalTourInProgress } from "./portal-product-tour";
import { loadLocalPortalProfile } from "./portal-profile";

const SKIP_ONCE_KEY = "siya-brand-intro-skip-once";
const SHOWN_DATE_KEY = "siya-brand-intro-shown-on";

/** Hold time before fade-out. Plus BRAND_INTRO_EXIT_MS ≈ 2.2s spec. */
export const BRAND_INTRO_HOLD_MS = 1900;
export const BRAND_INTRO_EXIT_MS = 300;
export const BRAND_INTRO_TOTAL_MS = BRAND_INTRO_HOLD_MS + BRAND_INTRO_EXIT_MS;
export const BRAND_INTRO_PREVIEW_MS = 8000;
export const BRAND_INTRO_REDUCED_MS = 450;

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** QA: `?previewIntro=1` always forces splash. */
export function isBrandIntroPreviewQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("previewIntro") === "1";
}

function readShownDate(): string | null {
  try {
    return localStorage.getItem(SHOWN_DATE_KEY);
  } catch {
    return null;
  }
}

export type BrandIntroGateOpts = {
  /**
   * When true (or when omitted and a portal tour is in progress), skip splash
   * so it does not cover the tour coach bar on first My day after tour start.
   * Preview query still forces show.
   */
  tourInProgress?: boolean;
};

/** True once per local day, unless skip-once, tour in progress, or already marked today. */
export function shouldShowBrandIntro(opts?: BrandIntroGateOpts): boolean {
  if (typeof window === "undefined") return false;
  if (isBrandIntroPreviewQuery()) return true;

  const tourActive =
    opts?.tourInProgress === true ||
    (opts?.tourInProgress !== false && isPortalTourInProgress(loadLocalPortalProfile()));
  if (tourActive) return false;

  try {
    if (sessionStorage.getItem(SKIP_ONCE_KEY) === "1") {
      sessionStorage.removeItem(SKIP_ONCE_KEY);
      return false;
    }
  } catch {
    /* private mode */
  }
  return readShownDate() !== localDateKey();
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

export function markBrandIntroShownToday(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SHOWN_DATE_KEY, localDateKey());
  } catch {
    /* private mode */
  }
}

/** Splash tagline — company startup moment (not the My day product line). */
export const BRAND_INTRO_TAGLINE = "Smart innovations for your aspirations.";

/**
 * Future sound toggle — keep false for office / autoplay safety.
 * Wire a short chime here later without changing splash timing.
 */
export const BRAND_INTRO_SOUND_ENABLED = false;
