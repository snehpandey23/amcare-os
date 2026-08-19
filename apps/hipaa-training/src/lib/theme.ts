/** Staff portal theme — dark default; light is opt-in via toggle. */

export const THEME_STORAGE_KEY = "siya-portal-theme-v2";

export type PortalTheme = "light" | "dark";

export function readStoredTheme(): PortalTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* private mode */
  }
  return null;
}

/** Fresh session with no stored preference → dark (Cursor-like workspace). */
export function resolveInitialTheme(): PortalTheme {
  return readStoredTheme() ?? "dark";
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme: PortalTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function persistTheme(theme: PortalTheme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** Inline boot script — dark unless the user explicitly chose light. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light")document.documentElement.classList.add("dark");}catch(e){}})();`;
