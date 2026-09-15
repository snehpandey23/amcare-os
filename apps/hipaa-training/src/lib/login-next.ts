/**
 * Post-login deep-link return (`?next=`).
 * Only same-origin relative paths — blocks open redirects.
 */

const NEXT_STORAGE_KEY = "siya-post-login-next";

/** Reject protocol-relative, absolute, and auth-loop URLs. */
export function safeInternalNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  decoded = decoded.trim();
  if (!decoded.startsWith("/")) return null;
  if (decoded.startsWith("//")) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) return null; // http:, javascript:, etc.
  if (decoded === "/login" || decoded.startsWith("/login?") || decoded.startsWith("/login#")) {
    return null;
  }
  if (decoded.startsWith("/forgot-password") || decoded.startsWith("/reset-password")) {
    return null;
  }
  // Cap length — deep links stay short; blocks abuse blobs
  if (decoded.length > 512) return null;
  return decoded;
}

/** Current location for `?next=` when bouncing an anonymous user to sign-in. */
export function currentPathForLoginNext(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function loginHrefForCurrentPage(): string {
  const next = currentPathForLoginNext();
  if (!next || next === "/" || next.startsWith("/login")) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}

export function stashPostLoginNext(path: string | null): void {
  if (typeof window === "undefined") return;
  const safe = safeInternalNextPath(path);
  if (!safe) {
    try {
      sessionStorage.removeItem(NEXT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    sessionStorage.setItem(NEXT_STORAGE_KEY, safe);
  } catch {
    /* ignore */
  }
}

export function takeStashedPostLoginNext(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(NEXT_STORAGE_KEY);
    sessionStorage.removeItem(NEXT_STORAGE_KEY);
    return safeInternalNextPath(v);
  } catch {
    return null;
  }
}
